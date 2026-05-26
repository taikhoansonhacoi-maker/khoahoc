"use client";
import { useState, useEffect, useRef } from "react";
import { COURSES } from "@/data/courses";
import { useStore } from "@/store/useStore";

const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

export default function Home() {
  const { user, wallet, bought, login, register, logout, topup, buyCourse } = useStore();
  const [modal, setModal] = useState<string | null>(null);
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [msg, setMsg] = useState("");
  const [topupAmt, setTopupAmt] = useState(100000);
  const [pg, setPg] = useState("home");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [lessonId, setLessonId] = useState(1);
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [copied, setCopied] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const prevWalletRef = useRef(wallet);

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 4000); };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  // ── Tự động kiểm tra số dư mỗi 3 giây khi modal topup mở ──
  useEffect(() => {
    if (modal !== "topup" || !user?.email) return;

    prevWalletRef.current = wallet;
    setChecking(true);

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/wallet?email=" + encodeURIComponent(user.email));
        const data = await res.json();
        const serverBalance = data.balance || 0;

        if (serverBalance > prevWalletRef.current) {
          const added = serverBalance - prevWalletRef.current;
          topup(added);
          prevWalletRef.current = serverBalance;
          setModal(null);
          setChecking(false);
          showToast("🎉 Đã nhận " + fmt(added) + "! Số dư: " + fmt(serverBalance));
        }
      } catch (e) {
        // Bỏ qua lỗi mạng
      }
    }, 3000);

    return () => { clearInterval(interval); setChecking(false); };
  }, [modal, user?.email]);

  const handleAuth = () => {
    if (tab === "login") {
      const err = login(form.email, form.password);
      if (err) { setMsg(err); return; }
      setModal(null); showToast("Chào mừng quay trở lại!");
    } else {
      if (!form.name || !form.email || !form.password) { setMsg("Vui lòng nhập đủ thông tin!"); return; }
      if (form.password.length < 6) { setMsg("Mật khẩu tối thiểu 6 ký tự!"); return; }
      const err = register(form.email, form.password, form.name);
      if (err) { setMsg(err); return; }
      setModal(null); showToast("Đăng ký thành công! Tặng bạn 50.000đ");
    }
  };

  const handleBuy = (id: number, price: number) => {
    if (!user) { setModal("login"); return; }
    const err = buyCourse(id, price);
    if (err) { showToast(err); if (err.includes("ví")) setModal("topup"); return; }
    showToast("Mua thành công!");
  };

  const course = COURSES.find(c => c.id === selectedId);
  const filtered = COURSES.filter(c =>
    (category === "all" || c.category === category) &&
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const qrUrl = "https://img.vietqr.io/image/VPB-6256816668-compact2.jpg?amount=" + topupAmt +
    "&addInfo=" + encodeURIComponent("NAPTIEN " + (user?.email || "")) +
    "&accountName=" + encodeURIComponent("DUONG VAN TUNG");

  return (
    <div style={{fontFamily:"'Segoe UI',sans-serif",background:"#f5f3ff",minHeight:"100vh"}}>
      <nav style={{background:"#fff",padding:"0 60px",display:"flex",alignItems:"center",justifyContent:"space-between",height:"68px",boxShadow:"0 2px 16px rgba(99,102,241,.08)",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:"40px"}}>
          <span onClick={() => setPg("home")} style={{fontWeight:800,fontSize:"22px",color:"#6366f1",cursor:"pointer"}}>▶ KhoaHoc</span>
          <div style={{display:"flex",gap:"32px"}}>
            {["Trang chủ","Khóa học","Blog","Tài liệu","Về chúng tôi"].map((m,i) => (
              <span key={m} onClick={() => i<=1 && setPg("home")} style={{fontSize:"15px",color:i===1?"#6366f1":"#64748b",fontWeight:i===1?"600":"400",cursor:"pointer",borderBottom:i===1?"2px solid #6366f1":"none",paddingBottom:"4px"}}>{m}</span>
            ))}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          {user ? (
            <>
              <span onClick={() => setModal("topup")} style={{background:"#f5f3ff",color:"#6366f1",padding:"8px 18px",borderRadius:"20px",fontSize:"14px",fontWeight:600,cursor:"pointer",border:"1.5px solid #c7d2fe"}}>💰 Ví: {fmt(wallet)}</span>
              <button onClick={() => { logout(); setPg("home"); }} style={{background:"#6366f1",color:"#fff",border:"none",padding:"10px 20px",borderRadius:"10px",cursor:"pointer",fontSize:"14px",fontWeight:600}}>Đăng xuất</button>
            </>
          ) : (
            <>
              <button onClick={() => { setModal("login"); setTab("login"); setMsg(""); }} style={{background:"none",border:"1.5px solid #e2e8f0",padding:"9px 20px",borderRadius:"10px",cursor:"pointer",fontSize:"14px",color:"#374151"}}>Đăng nhập</button>
              <button onClick={() => { setModal("login"); setTab("register"); setMsg(""); }} style={{background:"#6366f1",color:"#fff",border:"none",padding:"10px 20px",borderRadius:"10px",cursor:"pointer",fontSize:"14px",fontWeight:600}}>Đăng ký</button>
            </>
          )}
        </div>
      </nav>

      {pg === "home" && (
        <>
          <div style={{background:"linear-gradient(135deg,#6366f1 0%,#8b5cf6 60%,#a78bfa 100%)",padding:"32px 60px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"40px"}}>
            <div style={{flex:1}}>
              <div style={{background:"rgba(255,255,255,.2)",color:"#fff",fontSize:"11px",padding:"4px 14px",borderRadius:"20px",display:"inline-block",marginBottom:"12px",letterSpacing:"1px"}}>NÂNG CAO KỸ NĂNG – BỨT PHÁ THU NHẬP</div>
              <h1 style={{color:"#fff",fontSize:"36px",fontWeight:800,lineHeight:"1.2",marginBottom:"10px"}}>Học Marketing & <span style={{color:"#fbbf24"}}>TikTok</span> chuyên nghiệp</h1>
              <p style={{color:"rgba(255,255,255,.85)",fontSize:"14px",lineHeight:"1.7",marginBottom:"16px"}}>Các khóa học thực chiến, cập nhật liên tục giúp bạn xây kênh, chạy ads và tăng trưởng bền vững.</p>
              <button onClick={() => document.getElementById("courses-section")?.scrollIntoView({behavior:"smooth"})} style={{background:"#fff",color:"#6366f1",border:"none",padding:"10px 24px",borderRadius:"10px",cursor:"pointer",fontSize:"14px",fontWeight:700}}>Khám phá khóa học →</button>
            </div>
            <div style={{background:"rgba(255,255,255,.12)",borderRadius:"20px",padding:"20px",width:"300px",flexShrink:0,border:"1px solid rgba(255,255,255,.25)"}}>
              <div style={{color:"#fff",fontWeight:600,marginBottom:"12px",fontSize:"14px"}}>📊 Tổng quan</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
                {[["Học viên mới","+1.248"],["Hoàn thành","68.4%"],["Đơn hàng","3.682"],["Đánh giá","4.9/5"]].map(([label,val]) => (
                  <div key={label} style={{background:"rgba(255,255,255,.15)",borderRadius:"10px",padding:"12px"}}>
                    <div style={{color:"rgba(255,255,255,.7)",fontSize:"10px",marginBottom:"4px"}}>{label}</div>
                    <div style={{color:"#fff",fontSize:"18px",fontWeight:700}}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div id="courses-section" style={{padding:"40px 60px"}}>
            <div style={{maxWidth:"1400px",margin:"0 auto"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"24px",flexWrap:"wrap",gap:"12px"}}>
                <h2 style={{fontSize:"22px",fontWeight:700,color:"#0f172a"}}>✦ Tất cả khóa học</h2>
                <div style={{display:"flex",gap:"12px",alignItems:"center"}}>
                  <div style={{position:"relative"}}>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm khóa học..." style={{padding:"9px 36px 9px 14px",border:"1.5px solid #e2e8f0",borderRadius:"10px",fontSize:"14px",outline:"none",width:"200px",background:"#fff"}}/>
                    <span style={{position:"absolute",right:"10px",top:"50%",transform:"translateY(-50%)",color:"#94a3b8"}}>🔍</span>
                  </div>
                  <select value={category} onChange={e => setCategory(e.target.value)} style={{padding:"9px 14px",border:"1.5px solid #e2e8f0",borderRadius:"10px",fontSize:"14px",outline:"none",background:"#fff"}}>
                    <option value="all">Tất cả danh mục</option>
                    <option value="TikTok">TikTok</option>
                    <option value="TikTok Ads">TikTok Ads</option>
                    <option value="Facebook Ads">Facebook Ads</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:"20px"}}>
                {filtered.map(c => {
                  const owned = bought.includes(c.id);
                  return (
                    <div key={c.id} onClick={() => { setSelectedId(c.id); setPg("detail"); }}
                      style={{background:"#fff",borderRadius:"16px",overflow:"hidden",cursor:"pointer",boxShadow:"0 4px 20px rgba(99,102,241,.08)",border:"1.5px solid #e2e8f0",transition:"all .25s",opacity:c.comingSoon?0.85:1}}
                      onMouseEnter={e => { e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow="0 12px 32px rgba(99,102,241,.15)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 4px 20px rgba(99,102,241,.08)"; }}>
                      <div style={{height:"160px",position:"relative",overflow:"hidden",background:c.color+"22"}}>
                        <img src={c.image} alt={c.title} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                        {c.comingSoon ? (
                          <span style={{position:"absolute",top:"10px",left:"10px",background:"#64748b",color:"#fff",fontSize:"11px",padding:"2px 10px",borderRadius:"6px",fontWeight:700}}>🕐 Sắp ra mắt</span>
                        ) : (
                          <span style={{position:"absolute",top:"10px",left:"10px",background:c.tag==="hot"?"#f97316":"#6366f1",color:"#fff",fontSize:"11px",padding:"2px 10px",borderRadius:"6px",fontWeight:700}}>{c.tag==="hot"?"🔥 Hot":"✨ Mới"}</span>
                        )}
                        {owned && <span style={{position:"absolute",top:"10px",right:"10px",background:"#10b981",color:"#fff",fontSize:"11px",padding:"2px 10px",borderRadius:"6px",fontWeight:700}}>✓ Đã mua</span>}
                      </div>
                      <div style={{padding:"16px"}}>
                        <div style={{fontSize:"11px",color:"#94a3b8",marginBottom:"4px"}}>{c.category}</div>
                        <h3 style={{fontSize:"15px",fontWeight:700,color:"#0f172a",marginBottom:"6px",lineHeight:"1.4"}}>{c.title}</h3>
                        <div style={{fontSize:"12px",color:"#94a3b8",marginBottom:"12px"}}>{c.comingSoon ? "🕐 Đang cập nhật..." : `📋 ${c.lessons.length} bài học • Video + Tài liệu`}</div>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                          <div>
                            {c.comingSoon ? (
                              <span style={{fontSize:"14px",color:"#64748b",fontWeight:600}}>Sắp có</span>
                            ) : (
                              <>
                                <span style={{fontSize:"17px",fontWeight:700,color:"#6366f1"}}>{fmt(c.price)}</span>
                                <span style={{fontSize:"12px",color:"#94a3b8",textDecoration:"line-through",marginLeft:"6px"}}>{fmt(c.origPrice)}</span>
                              </>
                            )}
                          </div>
                          <button style={{background:c.comingSoon?"#f1f5f9":"#f5f3ff",color:c.comingSoon?"#64748b":"#6366f1",border:"1.5px solid "+(c.comingSoon?"#e2e8f0":"#c7d2fe"),padding:"6px 12px",borderRadius:"8px",fontSize:"12px",fontWeight:600,cursor:"pointer"}}>
                            {c.comingSoon?"Thông báo tôi":"Xem chi tiết →"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{maxWidth:"1400px",margin:"0 auto 40px",padding:"0 60px"}}>
            <div style={{background:"linear-gradient(135deg,#1e1b4b,#312e81)",borderRadius:"20px",padding:"28px 40px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:"20px"}}>
                <span style={{fontSize:"48px"}}>🎁</span>
                <div>
                  <div style={{color:"#fff",fontSize:"18px",fontWeight:700,marginBottom:"4px"}}>Ưu đãi dành riêng cho bạn</div>
                  <div style={{color:"rgba(255,255,255,.7)",fontSize:"13px"}}>Mua combo khóa học để nhận ưu đãi <span style={{color:"#fbbf24",fontWeight:600}}>giảm đến 30%</span></div>
                </div>
              </div>
              <button style={{background:"#6366f1",color:"#fff",border:"none",padding:"12px 24px",borderRadius:"10px",cursor:"pointer",fontSize:"14px",fontWeight:600}}>Xem combo ngay →</button>
            </div>
          </div>

          <div style={{maxWidth:"1400px",margin:"0 auto 48px",padding:"0 60px",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"20px"}}>
            {[["🎓","Học linh hoạt","Học mọi lúc, mọi nơi"],["🔒","Thanh toán an toàn","Bảo mật tuyệt đối"],["🎧","Hỗ trợ 24/7","Luôn sẵn sàng giúp bạn"],["📋","Hoàn tiền 7 ngày","Không hài lòng hoàn 100%"]].map(([icon,title,sub]) => (
              <div key={title} style={{background:"#fff",borderRadius:"14px",padding:"20px",textAlign:"center",boxShadow:"0 2px 12px rgba(99,102,241,.06)"}}>
                <div style={{fontSize:"28px",marginBottom:"10px"}}>{icon}</div>
                <div style={{fontWeight:600,color:"#0f172a",fontSize:"14px",marginBottom:"6px"}}>{title}</div>
                <div style={{color:"#94a3b8",fontSize:"12px",lineHeight:"1.6"}}>{sub}</div>
              </div>
            ))}
          </div>

          <div style={{background:"linear-gradient(135deg,#1e1b4b,#4c1d95)",padding:"48px 60px",textAlign:"center"}}>
            <h2 style={{color:"#fff",fontSize:"28px",fontWeight:800,marginBottom:"10px"}}>Sẵn sàng bứt phá cùng chúng tôi?</h2>
            <p style={{color:"rgba(255,255,255,.7)",marginBottom:"24px",fontSize:"14px"}}>Hàng nghìn học viên đã thành công. Bạn sẽ là người tiếp theo!</p>
            <button onClick={() => { setModal("login"); setTab("register"); }} style={{background:"#6366f1",color:"#fff",border:"none",padding:"14px 32px",borderRadius:"10px",cursor:"pointer",fontSize:"15px",fontWeight:700}}>Bắt đầu học ngay →</button>
          </div>
        </>
      )}

      {pg === "detail" && course && (
        <div style={{maxWidth:"900px",margin:"0 auto",padding:"40px 24px"}}>
          <button onClick={() => setPg("home")} style={{background:"none",border:"none",color:"#6366f1",cursor:"pointer",fontSize:"15px",marginBottom:"24px"}}>← Quay lại</button>
          <div style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)",borderRadius:"24px",padding:"32px",color:"#fff",marginBottom:"24px"}}>
            <div style={{fontSize:"48px",marginBottom:"12px"}}>{course.icon}</div>
            <h1 style={{fontSize:"26px",fontWeight:800,marginBottom:"8px"}}>{course.title}</h1>
            <p style={{opacity:.85,marginBottom:"16px",fontSize:"14px",lineHeight:"1.8"}}>{course.description}</p>
            {!course.comingSoon && (
              <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
                <span style={{fontSize:"28px",fontWeight:800}}>{fmt(course.price)}</span>
                <span style={{opacity:.6,textDecoration:"line-through"}}>{fmt(course.origPrice)}</span>
                <span style={{background:"#fbbf24",color:"#78350f",padding:"3px 10px",borderRadius:"6px",fontSize:"12px",fontWeight:700}}>Tiết kiệm {Math.round((1-course.price/course.origPrice)*100)}%</span>
              </div>
            )}
          </div>
          {course.comingSoon ? (
            <div style={{background:"#fff",borderRadius:"20px",padding:"40px",textAlign:"center",boxShadow:"0 4px 20px rgba(99,102,241,.08)"}}>
              <div style={{fontSize:"48px",marginBottom:"16px"}}>🕐</div>
              <h2 style={{fontSize:"20px",fontWeight:700,marginBottom:"8px",color:"#0f172a"}}>Khóa học đang được cập nhật</h2>
              <p style={{color:"#64748b",fontSize:"14px",marginBottom:"24px"}}>Chúng tôi đang hoàn thiện nội dung. Hãy đăng ký để nhận thông báo sớm nhất!</p>
              <button onClick={() => { if(!user) setModal("login"); else showToast("Đã đăng ký nhận thông báo!"); }} style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",border:"none",padding:"12px 28px",borderRadius:"12px",cursor:"pointer",fontSize:"14px",fontWeight:600}}>🔔 Thông báo khi có khóa học</button>
            </div>
          ) : (
            <>
              <div style={{background:"#fff",borderRadius:"20px",padding:"24px",marginBottom:"16px",boxShadow:"0 4px 20px rgba(99,102,241,.08)"}}>
                <h2 style={{fontWeight:700,marginBottom:"16px",fontSize:"16px"}}>📚 Nội dung khóa học</h2>
                {course.lessons.map((l,i) => {
                  const owned = bought.includes(course.id);
                  return (
                    <div key={l.id} onClick={() => owned && (setLessonId(l.id), setPg("lesson"))}
                      style={{display:"flex",alignItems:"center",gap:"12px",padding:"10px 12px",borderRadius:"10px",marginBottom:"6px",cursor:owned?"pointer":"default",background:"#f8fafc",border:"1px solid #e2e8f0"}}>
                      <div style={{width:"28px",height:"28px",borderRadius:"50%",background:owned?"#6366f1":"#e2e8f0",color:owned?"#fff":"#94a3b8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:700,flexShrink:0}}>{owned?i+1:"🔒"}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:"14px",fontWeight:500}}>{l.title}</div>
                        <div style={{fontSize:"12px",color:"#94a3b8"}}>{l.duration}</div>
                      </div>
                      {owned && <span style={{color:"#6366f1",fontSize:"12px"}}>▶ Xem</span>}
                    </div>
                  );
                })}
              </div>
              <div style={{background:"#fff",borderRadius:"20px",padding:"24px",boxShadow:"0 4px 20px rgba(99,102,241,.08)"}}>
                {bought.includes(course.id) ? (
                  <button onClick={() => { setLessonId(1); setPg("lesson"); }} style={{width:"100%",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",border:"none",padding:"14px",borderRadius:"12px",cursor:"pointer",fontSize:"15px",fontWeight:700}}>▶ Học ngay bài 1</button>
                ) : (
                  <>
                    <div style={{textAlign:"center",marginBottom:"16px"}}>
                      <div style={{fontSize:"13px",color:"#94a3b8",marginBottom:"4px"}}>Chỉ với</div>
                      <div style={{fontSize:"32px",fontWeight:800,color:"#6366f1"}}>{fmt(course.price)}</div>
                    </div>
                    <button onClick={() => handleBuy(course.id, course.price)} style={{width:"100%",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",border:"none",padding:"14px",borderRadius:"12px",cursor:"pointer",fontSize:"15px",fontWeight:700,marginBottom:"10px"}}>{user?"💳 Mua bằng ví":"Đăng nhập để mua"}</button>
                    {user && wallet < course.price && <p style={{textAlign:"center",fontSize:"12px",color:"#ef4444"}}>Ví không đủ. <span style={{color:"#6366f1",cursor:"pointer"}} onClick={() => setModal("topup")}>Nạp tiền ngay</span></p>}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {pg === "lesson" && course && (
        <div style={{maxWidth:"900px",margin:"0 auto",padding:"40px 24px"}}>
          <button onClick={() => setPg("detail")} style={{background:"none",border:"none",color:"#6366f1",cursor:"pointer",fontSize:"15px",marginBottom:"24px"}}>← Quay lại</button>
          <div style={{background:"#0f172a",borderRadius:"20px",overflow:"hidden",marginBottom:"20px"}}>
            <div style={{position:"relative",paddingTop:"56.25%"}}>
              <iframe
                style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:"none"}}
                src={"https://www.youtube.com/embed/" + (course.lessons.find(l=>l.id===lessonId)?.youtubeId || "") + "?rel=0&modestbranding=1"}
                title={course.lessons.find(l=>l.id===lessonId)?.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
          <div style={{background:"#fff",borderRadius:"20px",padding:"24px",boxShadow:"0 4px 20px rgba(99,102,241,.08)"}}>
            <h2 style={{fontWeight:700,marginBottom:"8px"}}>{course.lessons.find(l=>l.id===lessonId)?.title}</h2>
            <p style={{color:"#64748b",fontSize:"14px",marginBottom:"20px"}}>Bài {lessonId}/{course.lessons.length}</p>
            <div style={{display:"flex",gap:"10px"}}>
              {lessonId>1 && <button onClick={() => setLessonId(l=>l-1)} style={{border:"1.5px solid #e2e8f0",background:"#fff",padding:"10px 20px",borderRadius:"10px",cursor:"pointer",fontSize:"14px"}}>← Bài trước</button>}
              {lessonId<course.lessons.length
                ?<button onClick={() => setLessonId(l=>l+1)} style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",border:"none",padding:"10px 20px",borderRadius:"10px",cursor:"pointer",fontSize:"14px",fontWeight:600}}>Bài tiếp theo →</button>
                :<span style={{color:"#10b981",fontWeight:600,padding:"10px"}}>🎉 Hoàn thành!</span>}
            </div>
          </div>
        </div>
      )}

      {modal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"}} onClick={() => setModal(null)}>
          <div style={{background:"#fff",borderRadius:"24px",padding:"28px",width:"420px",maxWidth:"100%",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
            {modal==="topup" ? (
              <>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"16px"}}>
                  <h2 style={{fontWeight:700,fontSize:"18px",margin:0}}>💳 Nạp tiền vào ví</h2>
                  <span style={{fontSize:"13px",color:"#94a3b8"}}>Số dư: <b style={{color:"#6366f1"}}>{fmt(wallet)}</b></span>
                </div>

                {checking && (
                  <div style={{background:"#f0fdf4",border:"1.5px solid #86efac",borderRadius:"10px",padding:"10px 14px",marginBottom:"14px",display:"flex",alignItems:"center",gap:"8px"}}>
                    <span style={{fontSize:"16px"}}>⏳</span>
                    <span style={{fontSize:"13px",color:"#16a34a",fontWeight:600}}>Đang chờ xác nhận chuyển khoản...</span>
                  </div>
                )}

                <p style={{color:"#94a3b8",fontSize:"11px",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"8px"}}>Chọn số tiền nạp</p>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"8px",marginBottom:"16px"}}>
                  {[50000,100000,200000,300000,500000,1000000].map(a => (
                    <button key={a} onClick={() => setTopupAmt(a)} style={{padding:"10px",border:"1.5px solid "+(topupAmt===a?"#6366f1":"#e2e8f0"),borderRadius:"10px",background:topupAmt===a?"#f5f3ff":"#fff",color:topupAmt===a?"#6366f1":"#374151",cursor:"pointer",fontSize:"12px",fontWeight:600}}>{fmt(a)}</button>
                  ))}
                </div>

                <div style={{textAlign:"center",marginBottom:"16px"}}>
                  <p style={{fontSize:"11px",color:"#94a3b8",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"8px"}}>Quét QR chuyển khoản</p>
                  <div style={{display:"inline-block",border:"4px solid #f5f3ff",borderRadius:"14px",overflow:"hidden",boxShadow:"0 4px 20px rgba(99,102,241,.12)"}}>
                    <img src={qrUrl} alt="QR chuyen khoan" style={{width:"190px",height:"190px",display:"block"}}/>
                  </div>
                  <p style={{fontSize:"11px",color:"#94a3b8",marginTop:"6px"}}>Hỗ trợ tất cả app ngân hàng</p>
                </div>

                <div style={{background:"#f8fafc",borderRadius:"12px",padding:"14px",marginBottom:"12px",border:"1.5px solid #e2e8f0"}}>
                  <p style={{fontSize:"11px",color:"#94a3b8",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"10px"}}>📋 Thông tin chuyển khoản</p>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:"7px"}}>
                    <span style={{fontSize:"13px",color:"#64748b"}}>Ngân hàng</span>
                    <span style={{fontSize:"13px",fontWeight:700}}>VP Bank</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"7px"}}>
                    <span style={{fontSize:"13px",color:"#64748b"}}>Số tài khoản</span>
                    <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                      <span style={{fontSize:"13px",fontWeight:700}}>6256816668</span>
                      <button onClick={() => copyText("6256816668","acc")} style={{fontSize:"11px",color:"#6366f1",border:"1px solid #c7d2fe",background:"#f5f3ff",cursor:"pointer",padding:"2px 8px",borderRadius:"4px",fontWeight:600}}>{copied==="acc"?"✓":"Copy"}</button>
                    </div>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:"10px"}}>
                    <span style={{fontSize:"13px",color:"#64748b"}}>Chủ tài khoản</span>
                    <span style={{fontSize:"13px",fontWeight:700}}>DUONG VAN TUNG</span>
                  </div>
                  <div style={{background:"#fef3c7",border:"2px solid #fbbf24",borderRadius:"8px",padding:"10px"}}>
                    <p style={{fontSize:"11px",color:"#92400e",fontWeight:700,marginBottom:"6px"}}>📝 NỘI DUNG CK (BẮT BUỘC)</p>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"8px"}}>
                      <code style={{fontSize:"12px",fontWeight:800,color:"#92400e",letterSpacing:"0.5px",wordBreak:"break-all"}}>NAPTIEN {user?.email}</code>
                      <button onClick={() => copyText("NAPTIEN "+(user?.email||""),"content")} style={{flexShrink:0,fontSize:"11px",background:"#fbbf24",border:"none",borderRadius:"6px",padding:"4px 10px",cursor:"pointer",fontWeight:700,color:"#78350f"}}>{copied==="content"?"✓":"Copy"}</button>
                    </div>
                  </div>
                  <p style={{fontSize:"11px",color:"#ef4444",marginTop:"6px"}}>⚠️ Ghi sai nội dung → không tự động cộng tiền!</p>
                </div>

                <p style={{fontSize:"11px",color:"#94a3b8",textAlign:"center",marginBottom:"12px"}}>⚡ Tiền cộng tự động 1–2 phút sau khi chuyển thành công</p>
                <button onClick={() => setModal(null)} style={{width:"100%",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",border:"none",padding:"13px",borderRadius:"12px",cursor:"pointer",fontSize:"14px",fontWeight:700}}>Đóng</button>
              </>
            ) : (
              <>
                <div style={{display:"flex",borderBottom:"2px solid #e2e8f0",marginBottom:"20px"}}>
                  {["login","register"].map(t => (
                    <button key={t} onClick={() => { setTab(t); setMsg(""); }} style={{flex:1,padding:"10px",border:"none",background:"none",cursor:"pointer",fontSize:"14px",fontWeight:600,color:tab===t?"#6366f1":"#94a3b8",borderBottom:tab===t?"2px solid #6366f1":"none",marginBottom:"-2px"}}>{t==="login"?"Đăng nhập":"Đăng ký"}</button>
                  ))}
                </div>
                {tab==="register" && <input placeholder="Họ và tên" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} style={{width:"100%",border:"1.5px solid #e2e8f0",borderRadius:"10px",padding:"11px 14px",fontSize:"14px",marginBottom:"10px",outline:"none",boxSizing:"border-box"}}/>}
                <input placeholder="Email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} style={{width:"100%",border:"1.5px solid #e2e8f0",borderRadius:"10px",padding:"11px 14px",fontSize:"14px",marginBottom:"10px",outline:"none",boxSizing:"border-box"}}/>
                <input type="password" placeholder="Mật khẩu" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} style={{width:"100%",border:"1.5px solid #e2e8f0",borderRadius:"10px",padding:"11px 14px",fontSize:"14px",marginBottom:"14px",outline:"none",boxSizing:"border-box"}}/>
                {msg && <p style={{color:"#ef4444",fontSize:"12px",marginBottom:"10px"}}>{msg}</p>}
                <button onClick={handleAuth} style={{width:"100%",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",border:"none",padding:"13px",borderRadius:"12px",cursor:"pointer",fontSize:"14px",fontWeight:700}}>{tab==="login"?"Đăng nhập":"Tạo tài khoản"}</button>
              </>
            )}
          </div>
        </div>
      )}

      {toast && <div style={{position:"fixed",bottom:"20px",right:"20px",background:"#0f172a",color:"#fff",padding:"12px 20px",borderRadius:"12px",fontSize:"13px",zIndex:300,fontWeight:500,maxWidth:"300px"}}>{toast}</div>}
    </div>
  );
}