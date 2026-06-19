import express from 'express'
import OpenAI from 'openai'
import { protect } from '../middleware/verifyclerk.js'
import { checkCredits } from '../middleware/checkcredits.js'
import { saveCreation, incrementFreeUsage } from '../db/queries.js'
import multer from 'multer'
import path from 'path'
import FormData from 'form-data'
import fs from 'fs'


const router = express.Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${Date.now()}${ext}`)
  },
})

const upload = multer({ storage })

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
})

router.post('/generate-article', protect, checkCredits, async (req, res) => {
  try {
    const { prompt, length } = req.body
    const { userId } = req.auth

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `Write an article on the topic "${prompt}". Keep it around ${length} words.`,
        },
      ],
      temperature: 0.7,
      max_tokens: Math.min(length * 2, 3000),
    })

    const content = completion.choices[0].message.content

    await saveCreation(userId, prompt, content, 'article')

    if (req.dbUser.plan === 'free') {
      await incrementFreeUsage(userId)
    }

    res.json({ success: true, content })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: error.message })
  }
})

router.post('/generate-blog-titles', protect, checkCredits, async (req, res) => {
  try {
    const { keyword, category } = req.body
    const { userId } = req.auth

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `Generate 5 catchy, SEO-friendly blog title ideas for the keyword "${keyword}" in the category "${category}". Return only the 5 titles as a numbered list, no extra commentary.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 300,
    })

    const content = completion.choices[0].message.content

    await saveCreation(userId, `${keyword} (${category})`, content, 'blog-title')

    if (req.dbUser.plan === 'free') {
      await incrementFreeUsage(userId)
    }

    res.json({ success: true, content })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: error.message })
  }
})

router.post('/generate-image', protect, checkCredits, async (req, res) => {
  try {
    const { prompt } = req.body
    const { userId } = req.auth

    const encodedPrompt = encodeURIComponent(prompt)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&model=flux&nologo=true&seed=${Math.floor(Math.random() * 100000)}`

    const imgResponse = await fetch(imageUrl)
    if (!imgResponse.ok) throw new Error('Image generation failed')

    await saveCreation(userId, prompt, imageUrl, 'image')

    if (req.dbUser.plan === 'free') {
      await incrementFreeUsage(userId)
    }

    res.json({ success: true, content: imageUrl })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: error.message })
  }
})

router.post('/remove-background', protect, checkCredits, upload.single('image'), async (req, res) => {
  try {
    const { userId } = req.auth
    const filePath = req.file.path

    const formData = new FormData()
    formData.append('image_file', fs.createReadStream(filePath))
    formData.append('size', 'auto')

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.REMOVEBG_API_KEY,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.errors?.[0]?.title || 'Remove.bg API error')
    }

    const arrayBuffer = await response.arrayBuffer()
    const base64Image = `data:image/png;base64,${Buffer.from(arrayBuffer).toString('base64')}`

    fs.unlinkSync(filePath)

    await saveCreation(userId, 'Background removal', base64Image, 'bg-remove')

    if (req.dbUser.plan === 'free') {
      await incrementFreeUsage(userId)
    }

    res.json({ success: true, content: base64Image })
  } catch (error) {
    console.error(error)
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }
    res.status(500).json({ success: false, message: error.message })
  }
})

router.post('/resume-review', protect, checkCredits, upload.single('resume'), async (req, res) => {
  try {
    const { userId } = req.auth
    const filePath = req.file.path

    if (req.file.mimetype !== 'application/pdf') {
      fs.unlinkSync(filePath)
      return res.status(400).json({ success: false, message: 'Please upload a PDF file' })
    }

    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
    const dataBuffer = fs.readFileSync(filePath)

    const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(dataBuffer) }).promise

    let resumeText = ''
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map((item) => item.str).join(' ')
      resumeText += pageText + '\n'
    }

    fs.unlinkSync(filePath)

    if (!resumeText.trim()) {
      return res.status(400).json({ success: false, message: 'Could not extract text from PDF. Try a different file.' })
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `You are an expert resume reviewer. Analyze the following resume and provide:
1. Overall strengths
2. Weaknesses or gaps
3. Specific suggestions for improvement
4. ATS (Applicant Tracking System) compatibility score out of 100 with reasoning

Resume content:
${resumeText.slice(0, 6000)}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 1500,
    })

    const content = completion.choices[0].message.content

    await saveCreation(userId, 'Resume analysis', content, 'resume-review')

    if (req.dbUser.plan === 'free') {
      await incrementFreeUsage(userId)
    }

    res.json({ success: true, content })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: error.message })
  }
})
export default router   