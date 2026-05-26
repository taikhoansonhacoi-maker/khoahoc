import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'wallets.json')
const SEPAY_KEY = 'khoahoc_sepay_secret_2026'

function getWallets(): Record<string, number> {
  try {
    if (!fs.existsSync(DATA_FILE)) return {}
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
  } catch { return {} }
}

function saveWallets(data: Record<string, number>) {
  const dir = path.dirname(DATA_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
}

export async function POST(req: NextRequest) {
  // Xác thực API key từ SePay
  const auth = req.headers.get('authorization') || req.headers.get('x-api-key') || ''
  const key = auth.replace(/^Apikey\s+/i, '').trim()

  if (key !== SEPAY_KEY) {
    console.error('[SePay] Sai API key:', key)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { id, content, transferAmount, transferType } = body
  console.log('[SePay] Webhook:', { id, content, transferAmount, transferType })

  // Chỉ xử lý giao dịch nhận tiền
  if (transferType !== 'in') {
    return NextResponse.json({ success: true, message: 'Bỏ qua' })
  }

  // Tìm email trong nội dung: "NAPTIEN email@gmail.com"
  const match = (content || '').match(/NAPTIEN\s+(\S+@\S+)/i)
  if (!match) {
    console.warn('[SePay] Không tìm thấy email trong:', content)
    return NextResponse.json({ success: true, message: 'Không có email' })
  }

  const email = match[1].toLowerCase()
  const amount = Number(transferAmount)

  const wallets = getWallets()
  const before = wallets[email] || 0
  wallets[email] = before + amount
  saveWallets(wallets)

  console.log(`[SePay] ✅ Cộng ${amount}đ cho ${email}. Số dư mới: ${wallets[email]}đ`)

  return NextResponse.json({
    success: true,
    email,
    credited: amount,
    newBalance: wallets[email]
  })
}