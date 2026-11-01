// Fixed server.ts - Add the missing route
import express, { Request, Response } from 'express'
import cors from 'cors'
import http from 'http'
import os from 'os'

const app = express()
const PORT = Number(process.env.PORT) || 1525

// Basic middleware
app.use(express.json({ limit: '50mb' }))
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
  optionsSuccessStatus: 200
}))

// Get local LAN IP
function getLocalIp(): string {
  const interfaces = os.networkInterfaces()
  for (const iface of Object.values(interfaces)) {
    if (!iface) continue
    for (const info of iface) {
      if (info.family === 'IPv4' && !info.internal) {
        return info.address
      }
    }
  }
  return '127.0.0.1'
}

// Routes
app.get('/ping', (_req, res) => {
  console.log('Ping received')
  res.json({ pong: true, timestamp: Date.now() })
})

app.get('/server-ip', (_req: Request, res: Response): void => {
  const ip = getLocalIp()
  console.log(`Server IP request - returning: http://${ip}:${PORT}`)
  res.json({ ip, port: PORT })
})

// ADD THIS ROUTE - it was commented out but your components need it
app.get('/active-users', (_req: Request, res: Response): void => {
  console.log('Active users request received')
  // For now, return empty users array - you can expand this later
  res.json({ 
    users: [],
    timestamp: Date.now(),
    serverIp: getLocalIp()
  })
})

// Share file route - uncommented to fix the 404 error
app.post('/share-file', async (req: Request, res: Response): Promise<void> => {
  console.log('Share file request:', req.body)
  
  const { filePath, fileName } = req.body
  
  if (!filePath || !fileName) {
    res.status(400).json({ error: 'filePath and fileName are required' })
    return
  }
  
  // For now, just return a mock response that matches what FileSharer.vue expects
  const mockFile = {
    path: filePath,
    name: fileName,
    size: 1024 // Mock size, you'll need to get real file size later
  }
  
  console.log('Sharing file:', mockFile)
  res.json({ 
    success: true,
    message: 'File shared successfully',
    file: mockFile
  })
})

// Keep these commented for now - uncomment as needed:

app.get('/download-shared/:userId/:fileIndex', async (req: Request, res: Response): Promise<void> => {
  const { userId, fileIndex } = req.params
  console.log(`Download request for user ${userId}, file ${fileIndex}`)
  res.json({ message: `Would download from ${userId}, file ${fileIndex}` })
})

app.delete('/unshare-file/:fileIndex', async (req: Request, res: Response): Promise<void> => {
  const { fileIndex } = req.params
  console.log(`Unshare request for file ${fileIndex}`)
  res.json({ message: `Would unshare file ${fileIndex}` })
})


// Error handlers
app.use((err: any, res: Response) => {
  console.error('Global error handler:', err)
  res.status(500).json({ error: 'Internal server error', details: err.message })
})

app.use((req: Request, res: Response) => {
  console.log(`404 - Route not found: ${req.method} ${req.url}`)
  res.status(404).json({ error: 'Route not found', method: req.method, url: req.url })
})

export async function startServer(): Promise<http.Server> {
  console.log('Starting server with active-users route...')

  return new Promise((resolve, reject) => {
    const server = app.listen(PORT, '0.0.0.0', () => {
      const localIp = getLocalIp()
      console.log(`✅ Server listening on http://0.0.0.0:${PORT}`)
      console.log(`📡 Local network address: http://${localIp}:${PORT}`)
      console.log(`📋 Available routes:`)
      console.log(`   GET  /ping`)
      console.log(`   GET  /server-ip`) 
      console.log(`   GET  /active-users`)
      console.log(`   POST /share-file`)
      resolve(server)
    })

    server.on('error', (err) => {
      console.error('❌ Server error:', err)
      reject(err)
    })
  })
}

// The server listens on IPv4; do not probe "localhost", which may resolve to
// IPv6 (::1) and make a successful first launch look like a startup failure.
export async function getServerAddress(): Promise<string> {
  return `http://${getLocalIp()}:${PORT}`
}
