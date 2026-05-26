import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'wallets.json')

function getWallets(): Record<string, number> {
  try {
    if (!fs.existsSync(DATA_FILE)) return {}
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
  } catch { return {} }
}

// GET /api/wallet?email=xxx — lấy số dư từ server
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')
  if (!email) return NextResponse.json({ balance: 0 })

  const wallets = getWallets()
  const balance = wallets[email.toLowerCase()] || 0

  return NextResponse.json({ balance })
}