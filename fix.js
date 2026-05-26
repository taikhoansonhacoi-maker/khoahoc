const fs = require('fs');
let c = fs.readFileSync('app/page.tsx', 'utf8');

const oldText = `<button onClick={() => { topup(topupAmt); setModal(null); showToast("Nạp tiền thành công!"); }} style={{width:"100%",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",border:"none",padding:"13px",borderRadius:"12px",cursor:"pointer",fontSize:"14px",fontWeight:700}}>Nạp {fmt(topupAmt)} vào ví</button>`;

const newText = `<div style={{background:"#f8fafc",borderRadius:"12px",padding:"16px",marginBottom:"16px",border:"1.5px solid #e2e8f0"}}>
                  <div style={{fontSize:"13px",color:"#64748b",marginBottom:"8px",fontWeight:600}}>Thông tin chuyển khoản:</div>
                  <div style={{fontSize:"14px",marginBottom:"4px"}}>🏦 <b>Ngân hàng:</b> VP Bank</div>
                  <div style={{fontSize:"14px",marginBottom:"4px"}}>💳 <b>Số tài khoản:</b> 6256816668</div>
                  <div style={{fontSize:"14px",marginBottom:"4px"}}>👤 <b>Chủ TK:</b> DUONG VAN TUNG</div>
                  <div style={{fontSize:"14px",marginBottom:"12px",color:"#ef4444",fontWeight:600}}>📝 <b>Nội dung CK:</b> NAPTIEN {user?.email}</div>
                  <div style={{background:"#fff3cd",borderRadius:"8px",padding:"10px",fontSize:"12px",color:"#856404"}}>
                    ⚠️ Ghi đúng nội dung để hệ thống tự động cộng tiền!
                  </div>
                </div>
                <div style={{fontSize:"13px",color:"#64748b",textAlign:"center",marginBottom:"12px"}}>
                  Số tiền muốn nạp: <b style={{color:"#6366f1"}}>{fmt(topupAmt)}</b>
                </div>
                <button onClick={() => setModal(null)} style={{width:"100%",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",border:"none",padding:"13px",borderRadius:"12px",cursor:"pointer",fontSize:"14px",fontWeight:700}}>✅ Đã chuyển khoản xong</button>`;

if (c.includes('topup(topupAmt)')) {
  c = c.replace(oldText, newText);
  fs.writeFileSync('app/page.tsx', c, 'utf8');
  console.log('Done!');
} else {
  console.log('Không tìm thấy!');
}