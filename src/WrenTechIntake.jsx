import { useState } from "react";

const STEPS = [
  "About your business",
  "Your team",
  "Website goals",
  "Pages & features",
  "Worker portal",
  "Timeline & budget",
  "Summary"
];

const MultiPill = ({ options, selected=[], onToggle }) => (
  <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
    {options.map(o => {
      const on = selected.includes(o);
      return (
        <button key={o} onClick={() => onToggle(o)} style={{
          padding:"8px 18px", borderRadius:28, fontSize:13, cursor:"pointer",
          border: on ? "1.5px solid #E89B7B" : "1px solid rgba(229,217,210,0.18)",
          background: on ? "rgba(232,155,123,0.15)" : "transparent",
          color: on ? "#E89B7B" : "rgba(229,217,210,0.6)",
          fontFamily:"'Inter',sans-serif", fontWeight: on ? 500 : 400,
          transition:"all 0.15s"
        }}>{o}</button>
      );
    })}
  </div>
);

const Toggle = ({ options, value, onChange }) => (
  <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
    {options.map(o => (
      <button key={o} onClick={() => onChange(o)} style={{
        padding:"9px 20px", borderRadius:28, fontSize:13, cursor:"pointer",
        border: value === o ? "1.5px solid #E89B7B" : "1px solid rgba(229,217,210,0.2)",
        background: value === o ? "#E89B7B" : "rgba(229,217,210,0.06)",
        color: value === o ? "#1F3530" : "#C9BBAE",
        fontFamily:"'Inter',sans-serif", fontWeight: value === o ? 600 : 400,
        transition:"all 0.15s"
      }}>{o}</button>
    ))}
  </div>
);

const Lbl = ({ children, hint }) => (
  <div style={{ marginBottom:8 }}>
    <div style={{ fontSize:11, letterSpacing:"0.1em", textTransform:"uppercase", color:"#B5C5BD", fontFamily:"'Inter',sans-serif", fontWeight:500 }}>{children}</div>
    {hint && <div style={{ fontSize:12, color:"rgba(181,197,189,0.5)", marginTop:3, fontFamily:"'Inter',sans-serif", lineHeight:1.5 }}>{hint}</div>}
  </div>
);

const Inp = ({ value, onChange, placeholder, type="text" }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{
    width:"100%", boxSizing:"border-box", border:"1px solid rgba(229,217,210,0.15)",
    borderRadius:10, padding:"12px 16px", fontSize:14, fontFamily:"'Inter',sans-serif",
    background:"rgba(229,217,210,0.05)", color:"#E8D9D2", outline:"none"
  }} />
);

const Txt = ({ value, onChange, placeholder, rows=3 }) => (
  <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} style={{
    width:"100%", boxSizing:"border-box", border:"1px solid rgba(229,217,210,0.15)",
    borderRadius:10, padding:"12px 16px", fontSize:14, fontFamily:"'Inter',sans-serif",
    background:"rgba(229,217,210,0.05)", color:"#E8D9D2", outline:"none",
    resize:"vertical", lineHeight:1.65
  }} />
);

const Sel = ({ value, onChange, options, placeholder="Select..." }) => (
  <select value={value} onChange={onChange} style={{
    width:"100%", border:"1px solid rgba(229,217,210,0.15)", borderRadius:10,
    padding:"12px 16px", fontSize:14, fontFamily:"'Inter',sans-serif",
    background:"rgba(15,31,27,0.9)", color: value ? "#E8D9D2" : "rgba(229,217,210,0.4)",
    outline:"none"
  }}>
    <option value="">{placeholder}</option>
    {options.map(o => <option key={o} value={o} style={{background:"#1F3530",color:"#E8D9D2"}}>{o}</option>)}
  </select>
);

const F = ({ children }) => <div style={{ marginBottom:22 }}>{children}</div>;
const G2 = ({ children }) => <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>{children}</div>;

const SH = ({ children }) => (
  <div style={{ marginBottom:24, marginTop:8 }}>
    <div style={{ display:"flex", alignItems:"center", gap:16 }}>
      <span style={{ fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:"#E89B7B", fontFamily:"'Inter',sans-serif", fontWeight:600, whiteSpace:"nowrap" }}>{children}</span>
      <div style={{ flex:1, height:1, background:"rgba(232,155,123,0.25)" }} />
    </div>
  </div>
);

export default function WrenTechIntake() {
  const [step, setStep] = useState(0);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [biz, setBiz] = useState({ ownerName:"", bizName:"", phone:"", email:"", address:"", years:"", serviceArea:"", services:[], otherService:"", peakSeason:"", whatMakesYouDifferent:"" });
  const [team, setTeam] = useState({ salesCount:"", installerCount:"", officeCount:"", installerNames:"", salesNames:"", officeNames:"", installersAre:"", howYouCommunicate:"", biggestTeamProblem:"" });
  const [site, setSite] = useState({ goals:[], primaryGoal:"", competitors:"", styleWords:[], toneWords:[], colorPref:"", hasLogo:"", hasPhotos:"", needsPhotography:"" });
  const [pages, setPages] = useState({ wantedPages:[], otherPages:"", quoteForm:"", testimonials:"", financing:"", gallery:"", seo:"", chat:"", brands:"" });
  const [portal, setPortal] = useState({ portalFeatures:[], timeOff:"", jobFlow:"", emergencyFlow:"", leadTracking:"", notifications:"", mobileImportance:"", whoSeesWhat:"", otherPortalNotes:"" });
  const [tl, setTl] = useState({ websiteTimeline:"", portalTimeline:"", websiteBudget:"", portalBudget:"", maintenance:"", decisionMaker:"", nextStep:"", anythingElse:"" });

  const tog = (obj, set, key, val) => { const c=obj[key]||[]; set({...obj,[key]:c.includes(val)?c.filter(x=>x!==val):[...c,val]}); };
  const nav = (d) => setStep(s => s + d);

  const gen = async () => {
    setLoading(true);
    setSummary("");
    setSubmitError("");
    setSaved(false);
    try {
      const intake = { biz, team, site, pages, portal, timeline: tl };
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(intake),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not save your responses.");
      setSaved(true);
      setSummary(json.summary || "Your responses were saved. Jennifer will follow up with a full project summary.");
    } catch (e) {
      setSubmitError(e.message || "Error saving your responses. Please try again.");
      setSummary("");
    }
    setLoading(false);
  };

  const Btns = ({ back=true, nextLabel="Continue →", onNext }) => (
    <div style={{ display:"flex", gap:12, marginTop:36 }}>
      {back && <button onClick={()=>nav(-1)} style={{ flex:1, padding:"13px", border:"1px solid rgba(229,217,210,0.2)", borderRadius:10, background:"transparent", fontFamily:"'Inter',sans-serif", fontSize:14, cursor:"pointer", color:"#C9BBAE" }}>Back</button>}
      <button onClick={onNext||(()=>nav(1))} style={{ flex:2, padding:"13px", border:"none", borderRadius:10, background:"#E89B7B", color:"#1F3530", fontFamily:"'Inter',sans-serif", fontSize:14, cursor:"pointer", fontWeight:600, letterSpacing:"0.02em" }}>{nextLabel}</button>
    </div>
  );

  const Bar = () => (
    <div style={{ marginBottom:32 }}>
      <div style={{ display:"flex", gap:4, marginBottom:14 }}>
        {STEPS.map((s,i) => (
          <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i<=step ? "#E89B7B" : "rgba(229,217,210,0.1)", transition:"background 0.3s" }} />
        ))}
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
        <div style={{ fontFamily:"'Inter',sans-serif", fontSize:11, letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(181,197,189,0.6)" }}>Step {step+1} of {STEPS.length}</div>
        <div style={{ fontFamily:"'Inter',sans-serif", fontSize:11, letterSpacing:"0.1em", textTransform:"uppercase", color:"#E89B7B", fontWeight:600 }}>{STEPS[step]}</div>
      </div>
    </div>
  );

  const Head = ({ title, sub }) => (
    <div style={{ marginBottom:10 }}>
      <h2 style={{ fontFamily:"'Fraunces','Georgia',serif", fontStyle:"italic", fontWeight:700, fontSize:28, color:"#E8D9D2", lineHeight:1.2, margin:0 }}>{title}</h2>
      {sub && <p style={{ fontFamily:"'Inter',sans-serif", fontSize:14, color:"rgba(181,197,189,0.6)", marginTop:8, lineHeight:1.6 }}>{sub}</p>}
    </div>
  );

  const shell = { background:"#1F3530", borderRadius:16, overflow:"hidden", fontFamily:"'Inter',sans-serif", color:"#E8D9D2", maxWidth:700 };
  const hdr = { background:"rgba(0,0,0,0.15)", padding:"20px 32px", display:"flex", justifyContent:"space-between", alignItems:"center" };
  const bd = { padding:"28px 32px 32px" };

  const TopBar = () => (
    <div style={hdr}>
      <div>
        <span style={{ fontFamily:"'Fraunces','Georgia',serif", fontStyle:"italic", fontWeight:700, fontSize:15, color:"#E89B7B" }}>WrenTech</span>
        <span style={{ fontSize:12, color:"rgba(181,197,189,0.5)", marginLeft:12, letterSpacing:"0.06em", textTransform:"uppercase" }}>Project Intake</span>
      </div>
      <div style={{ fontSize:12, color:"rgba(181,197,189,0.4)" }}>wrentech.net</div>
    </div>
  );

  const Font = () => <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,700;1,400;1,700;1,900&family=Inter:wght@300;400;500;600&family=IBM+Plex+Mono:wght@300;400;500&display=swap" rel="stylesheet" />;

  // ═══════ STEP 0: ABOUT YOUR BUSINESS ═══════
  if (step === 0) return (
    <div style={shell}><Font /><TopBar />
      <div style={bd}>
        <Bar />
        <Head title="Tell us about your business." sub="We're building your website and worker portal from the ground up. The more we know, the better we can build it." />
        <SH>Your info</SH>
        <G2>
          <F><Lbl>Your name</Lbl><Inp value={biz.ownerName} onChange={e=>setBiz({...biz,ownerName:e.target.value})} placeholder="Scott Jaynes" /></F>
          <F><Lbl>Business name</Lbl><Inp value={biz.bizName} onChange={e=>setBiz({...biz,bizName:e.target.value})} placeholder="Jaynes Flooring" /></F>
          <F><Lbl>Phone</Lbl><Inp value={biz.phone} onChange={e=>setBiz({...biz,phone:e.target.value})} placeholder="(423) 639-1901" /></F>
          <F><Lbl>Email</Lbl><Inp value={biz.email} onChange={e=>setBiz({...biz,email:e.target.value})} placeholder="scott@jaynesflooring.com" type="email" /></F>
        </G2>
        <F><Lbl>Business address</Lbl><Inp value={biz.address} onChange={e=>setBiz({...biz,address:e.target.value})} placeholder="3245 E. Andrew Johnson Hwy, Greeneville TN 37745" /></F>
        <G2>
          <F><Lbl>How long have you been in business?</Lbl><Sel value={biz.years} onChange={e=>setBiz({...biz,years:e.target.value})} options={["Under 5 years","5–10 years","10–20 years","20–30 years","30–40 years","40–50 years","50+ years"]} /></F>
          <F><Lbl>Where do you serve?</Lbl><Inp value={biz.serviceArea} onChange={e=>setBiz({...biz,serviceArea:e.target.value})} placeholder="Greene County, surrounding areas..." /></F>
        </G2>
        <SH>What you do</SH>
        <F><Lbl>What types of flooring do you install and sell?</Lbl>
          <MultiPill options={["Carpet","LVP / Luxury Vinyl Plank","Hardwood","Laminate","Tile & Ceramic","Natural Stone","Vinyl Sheet","Area Rugs","Commercial Flooring","Countertops"]} selected={biz.services} onToggle={v=>tog(biz,setBiz,"services",v)} />
          <div style={{marginTop:10}}><Inp value={biz.otherService} onChange={e=>setBiz({...biz,otherService:e.target.value})} placeholder="Anything else you offer..." /></div>
        </F>
        <F><Lbl>When's your busiest time of year?</Lbl><Inp value={biz.peakSeason} onChange={e=>setBiz({...biz,peakSeason:e.target.value})} placeholder="Spring, before holidays, etc." /></F>
        <F><Lbl>What makes your business different from other flooring companies?</Lbl><Txt value={biz.whatMakesYouDifferent} onChange={e=>setBiz({...biz,whatMakesYouDifferent:e.target.value})} placeholder="50 years in business, largest showroom in East TN, family owned, best installers around..." rows={2} /></F>
        <Btns back={false} />
      </div>
    </div>
  );

  // ═══════ STEP 1: YOUR TEAM ═══════
  if (step === 1) return (
    <div style={shell}><Font /><TopBar />
      <div style={bd}>
        <Bar />
        <Head title="Tell us about your team." sub="We need to know who's on your crew so we can build the portal around how your people actually work." />
        <SH>Team size</SH>
        <G2>
          <F><Lbl>How many salespeople?</Lbl><Sel value={team.salesCount} onChange={e=>setTeam({...team,salesCount:e.target.value})} options={["1","2","3","4","5","6–10","10+"]} /></F>
          <F><Lbl>How many installers / subcontractors?</Lbl><Sel value={team.installerCount} onChange={e=>setTeam({...team,installerCount:e.target.value})} options={["1–3","4–6","7–10","10+"]} /></F>
        </G2>
        <F><Lbl>Office / admin staff?</Lbl><Sel value={team.officeCount} onChange={e=>setTeam({...team,officeCount:e.target.value})} options={["0","1","2","3","4+"]} /></F>
        <SH>Who's who</SH>
        <F><Lbl>Installer / subcontractor names and roles</Lbl><Txt value={team.installerNames} onChange={e=>setTeam({...team,installerNames:e.target.value})} placeholder="List each person and what they do — e.g. Mike (carpet), James + Tony (LVP crew)..." rows={3} /></F>
        <F><Lbl>Salespeople names</Lbl><Txt value={team.salesNames} onChange={e=>setTeam({...team,salesNames:e.target.value})} placeholder="e.g. Sydney (showroom), Andrew (sales manager)..." rows={2} /></F>
        <F><Lbl>Office / admin names</Lbl><Inp value={team.officeNames} onChange={e=>setTeam({...team,officeNames:e.target.value})} placeholder="Names and what they handle..." /></F>
        <SH>How things work now</SH>
        <F><Lbl>Are your installers employees or subcontractors?</Lbl><Toggle options={["Employees","Subcontractors","Mix of both"]} value={team.installersAre} onChange={v=>setTeam({...team,installersAre:v})} /></F>
        <F><Lbl>How do you communicate with your team right now?</Lbl><Toggle options={["Phone calls","Group text","In person","Email","A mix of everything"]} value={team.howYouCommunicate} onChange={v=>setTeam({...team,howYouCommunicate:v})} /></F>
        <F><Lbl>What's your biggest headache with managing your team day-to-day?</Lbl><Txt value={team.biggestTeamProblem} onChange={e=>setTeam({...team,biggestTeamProblem:e.target.value})} placeholder="Calling everybody every morning, nobody knows who's going where, people calling in sick last minute..." rows={3} /></F>
        <Btns />
      </div>
    </div>
  );

  // ═══════ STEP 2: WEBSITE GOALS ═══════
  if (step === 2) return (
    <div style={shell}><Font /><TopBar />
      <div style={bd}>
        <Bar />
        <Head title="What should your website do for you?" sub="You don't have a website right now — we're building one from scratch. Let's make sure it works hard for your business." />
        <SH>Goals</SH>
        <F><Lbl>What do you want the website to accomplish? (pick all that apply)</Lbl>
          <MultiPill options={["Get more customers calling","Show up when people search Google","Show off your work — before/afters","Make the business look professional","Let people request quotes online","Reduce the number of phone calls you deal with","Show the brands you carry","Tell your story — 50 years in business","Let customers see your reviews","Help people find your showroom"]} selected={site.goals} onToggle={v=>tog(site,setSite,"goals",v)} />
        </F>
        <F><Lbl>If the website only does one thing well — what matters most?</Lbl><Inp value={site.primaryGoal} onChange={e=>setSite({...site,primaryGoal:e.target.value})} placeholder="Get people to call me, get quote requests, look professional..." /></F>
        <SH>Look and feel</SH>
        <F><Lbl>Are there any websites you've seen — any business, not just flooring — that you like the look of?</Lbl><Txt value={site.competitors} onChange={e=>setSite({...site,competitors:e.target.value})} placeholder="Names or URLs — or just describe what you liked about them..." rows={2} /></F>
        <F><Lbl>What style feels right for your business?</Lbl>
          <MultiPill options={["Clean & modern","Warm & inviting","Bold & high-end","Classic / traditional","Bright & friendly","Photo-forward","Local & trustworthy"]} selected={site.styleWords} onToggle={v=>tog(site,setSite,"styleWords",v)} />
        </F>
        <F><Lbl>How should the website sound when people read it?</Lbl>
          <MultiPill options={["Like a friendly neighbor","Like a professional expert","Family owned & proud","Straight to the point","Premium & polished","Community rooted"]} selected={site.toneWords} onToggle={v=>tog(site,setSite,"toneWords",v)} />
        </F>
        <F><Lbl>Any color preferences or colors you hate?</Lbl><Inp value={site.colorPref} onChange={e=>setSite({...site,colorPref:e.target.value})} placeholder="Love navy and red (your logo), hate purple..." /></F>
        <SH>What you already have</SH>
        <G2>
          <F><Lbl>Do you have a high-quality logo?</Lbl><Toggle options={["Yes","Low quality","No"]} value={site.hasLogo} onChange={v=>setSite({...site,hasLogo:v})} /></F>
          <F><Lbl>Photos of your work?</Lbl><Toggle options={["Lots","Some","Almost none"]} value={site.hasPhotos} onChange={v=>setSite({...site,hasPhotos:v})} /></F>
        </G2>
        <F><Lbl>Would you like professional photography added to this project?</Lbl><Toggle options={["Yes","No","Maybe later"]} value={site.needsPhotography} onChange={v=>setSite({...site,needsPhotography:v})} /></F>
        <Btns />
      </div>
    </div>
  );

  // ═══════ STEP 3: PAGES & FEATURES ═══════
  if (step === 3) return (
    <div style={shell}><Font /><TopBar />
      <div style={bd}>
        <Bar />
        <Head title="What should be on your website?" sub="Check every page you want. We'll build all of them." />
        <SH>Pages</SH>
        <F>
          <MultiPill options={["Home","About us / our story","Services we offer","Flooring gallery","Brands we carry","Customer reviews","Get a free quote","Financing options","Service area map","Blog / flooring tips","FAQ","Showroom info & hours","Commercial flooring","We're hiring","Privacy policy"]} selected={pages.wantedPages} onToggle={v=>tog(pages,setPages,"wantedPages",v)} />
        </F>
        <F><Lbl>Any other pages you want that aren't listed?</Lbl><Inp value={pages.otherPages} onChange={e=>setPages({...pages,otherPages:e.target.value})} placeholder="Anything else..." /></F>
        <SH>Features</SH>
        <G2>
          <F><Lbl>Online quote request form?</Lbl><Sel value={pages.quoteForm} onChange={e=>setPages({...pages,quoteForm:e.target.value})} options={["Must have","Nice to have","Don't need it"]} /></F>
          <F><Lbl>Show customer reviews on the site?</Lbl><Sel value={pages.testimonials} onChange={e=>setPages({...pages,testimonials:e.target.value})} options={["Yes — pull from Google/Yelp","Yes — I'll add them manually","No"]} /></F>
          <F><Lbl>Financing page?</Lbl><Sel value={pages.financing} onChange={e=>setPages({...pages,financing:e.target.value})} options={["Yes — we offer financing","No — we don't","Not sure"]} /></F>
          <F><Lbl>Before/after photo gallery?</Lbl><Sel value={pages.gallery} onChange={e=>setPages({...pages,gallery:e.target.value})} options={["Yes — filterable by floor type","Simple photo grid","Don't need a gallery"]} /></F>
          <F><Lbl>Brands you carry — featured on site?</Lbl><Sel value={pages.brands} onChange={e=>setPages({...pages,brands:e.target.value})} options={["Yes — with logos","Just list them","No"]} /></F>
          <F><Lbl>How important is showing up on Google?</Lbl><Sel value={pages.seo} onChange={e=>setPages({...pages,seo:e.target.value})} options={["Very — major priority","Somewhat","Not worried about it"]} /></F>
        </G2>
        <Btns />
      </div>
    </div>
  );

  // ═══════ STEP 4: WORKER PORTAL ═══════
  if (step === 4) return (
    <div style={shell}><Font /><TopBar />
      <div style={bd}>
        <Bar />
        <Head title="Your worker portal." sub="This is a private command center for your team — installers, salespeople, and office staff. Everyone logs in, sees their schedule, updates their jobs, and stays on the same page." />
        <SH>What should the portal do?</SH>
        <F><Lbl hint="Check everything you want your team to be able to do from their phone or computer.">Portal features</Lbl>
          <MultiPill options={[
            "Each person has their own login",
            "See my upcoming jobs",
            "See the full team schedule",
            "Request a day off",
            "Report an emergency / sick day",
            "Get notified when I'm assigned a job",
            "Update job status — in progress, done",
            "Upload photos from the job site",
            "See customer info for each job",
            "Track new leads and quote requests",
            "Assign specific crews to jobs",
            "Admin dashboard for Scott / management"
          ]} selected={portal.portalFeatures} onToggle={v=>tog(portal,setPortal,"portalFeatures",v)} />
        </F>
        <SH>Scheduling & jobs</SH>
        <F><Lbl>When an installer needs a day off, how should that work?</Lbl><Sel value={portal.timeOff} onChange={e=>setPortal({...portal,timeOff:e.target.value})} options={["They request it — I approve or deny","They submit it — auto approved","Shared calendar they update themselves","Phone / text is fine for this"]} /></F>
        <F><Lbl>When a new job gets scheduled, how should the installer find out?</Lbl><Sel value={portal.jobFlow} onChange={e=>setPortal({...portal,jobFlow:e.target.value})} options={["Text message notification","Email notification","They check the portal daily","I want the portal to handle all of this"]} /></F>
        <F><Lbl hint="Example: an installer wakes up sick and the install is today.">When there's an emergency or someone calls in sick, what should happen?</Lbl><Txt value={portal.emergencyFlow} onChange={e=>setPortal({...portal,emergencyFlow:e.target.value})} placeholder="Installer marks 'emergency' → you get an alert → you reassign the job → new installer gets notified → customer gets notified..." rows={3} /></F>
        <SH>Leads & customers</SH>
        <F><Lbl>Should the portal track incoming leads and quote requests?</Lbl><Toggle options={["Yes","No","Not sure yet"]} value={portal.leadTracking} onChange={v=>setPortal({...portal,leadTracking:v})} /></F>
        <SH>Access & mobile</SH>
        <F><Lbl>Who should see what?</Lbl><Txt value={portal.whoSeesWhat} onChange={e=>setPortal({...portal,whoSeesWhat:e.target.value})} placeholder="e.g. Scott sees everything. Salespeople see leads + schedule. Installers see only their own jobs..." rows={2} /></F>
        <F><Lbl>How important is it that this works great on a phone?</Lbl><Toggle options={["Critical — installers are in the field","Important","Nice to have","Desktop is fine"]} value={portal.mobileImportance} onChange={v=>setPortal({...portal,mobileImportance:v})} /></F>
        <F><Lbl>How do you want to be notified about portal activity?</Lbl><Toggle options={["Text / SMS","Email","In the portal","Whatever works"]} value={portal.notifications} onChange={v=>setPortal({...portal,notifications:v})} /></F>
        <F><Lbl>Anything else about the portal?</Lbl><Txt value={portal.otherPortalNotes} onChange={e=>setPortal({...portal,otherPortalNotes:e.target.value})} placeholder="Anything we didn't ask about..." rows={2} /></F>
        <Btns />
      </div>
    </div>
  );

  // ═══════ STEP 5: TIMELINE & BUDGET ═══════
  if (step === 5) return (
    <div style={shell}><Font /><TopBar />
      <div style={bd}>
        <Bar />
        <Head title="Timeline & investment." sub="When do you need it, and what are you comfortable investing?" />
        <SH>Timeline</SH>
        <G2>
          <F><Lbl>When do you want the website up?</Lbl><Sel value={tl.websiteTimeline} onChange={e=>setTl({...tl,websiteTimeline:e.target.value})} options={["ASAP","Within 30 days","30–60 days","60–90 days","No rush"]} /></F>
          <F><Lbl>When do you want the portal ready?</Lbl><Sel value={tl.portalTimeline} onChange={e=>setTl({...tl,portalTimeline:e.target.value})} options={["Same time as website","After website launches","Within 60 days","90 days","No rush"]} /></F>
        </G2>
        <SH>Budget</SH>
        <G2>
          <F><Lbl>Website budget range</Lbl><Sel value={tl.websiteBudget} onChange={e=>setTl({...tl,websiteBudget:e.target.value})} options={["Under $1,000","$1,000–$2,500","$2,500–$5,000","$5,000–$10,000","$10,000+","Let's discuss"]} /></F>
          <F><Lbl>Worker portal budget range</Lbl><Sel value={tl.portalBudget} onChange={e=>setTl({...tl,portalBudget:e.target.value})} options={["Under $1,000","$1,000–$3,000","$3,000–$6,000","$6,000+","Let's discuss"]} /></F>
        </G2>
        <F><Lbl>Would you want ongoing monthly maintenance and support?</Lbl><Toggle options={["Yes — monthly plan","Only when I need something","I'll handle it myself","Not sure"]} value={tl.maintenance} onChange={v=>setTl({...tl,maintenance:v})} /></F>
        <SH>Final details</SH>
        <F><Lbl>Is this your decision alone, or does anyone else need to sign off?</Lbl><Inp value={tl.decisionMaker} onChange={e=>setTl({...tl,decisionMaker:e.target.value})} placeholder="Just me, me + my wife, me + Andrew..." /></F>
        <F><Lbl>What would you like to happen next?</Lbl><Inp value={tl.nextStep} onChange={e=>setTl({...tl,nextStep:e.target.value})} placeholder="Send me a proposal, schedule a follow-up, let's get started..." /></F>
        <F><Lbl>Anything else you want us to know?</Lbl><Txt value={tl.anythingElse} onChange={e=>setTl({...tl,anythingElse:e.target.value})} placeholder="Concerns, ideas, things you forgot to mention..." rows={3} /></F>
        <Btns nextLabel="Submit intake →" onNext={()=>{nav(1);gen();}} />
      </div>
    </div>
  );

  // ═══════ STEP 6: REPORT ═══════
  return (
    <div style={shell}><Font /><TopBar />
      <div style={bd}>
        <Bar />
        {loading ? (
          <div style={{ textAlign:"center", padding:"60px 0" }}>
            <div style={{ fontFamily:"'Fraunces',serif", fontStyle:"italic", fontSize:22, color:"#E89B7B", marginBottom:8 }}>Sending your responses...</div>
            <div style={{ fontSize:13, color:"rgba(181,197,189,0.5)" }}>Saving everything securely so nothing gets lost</div>
          </div>
        ) : submitError ? (
          <>
            <Head title="Something went wrong" sub="Your answers weren't saved yet. Please try again." />
            <div style={{ background:"rgba(232,93,74,0.12)", border:"1px solid rgba(232,93,74,0.35)", borderRadius:12, padding:"18px 20px", fontSize:14, color:"#E8D9D2", marginBottom:20 }}>{submitError}</div>
            <button onClick={gen} style={{ width:"100%", padding:"13px", border:"none", borderRadius:10, background:"#E89B7B", color:"#1F3530", fontFamily:"'Inter',sans-serif", fontSize:14, cursor:"pointer", fontWeight:600 }}>Try again</button>
          </>
        ) : (
          <>
            {saved && (
              <div style={{ background:"rgba(232,155,123,0.12)", border:"1px solid rgba(232,155,123,0.35)", borderRadius:12, padding:"18px 20px", marginBottom:24 }}>
                <div style={{ fontFamily:"'Fraunces',serif", fontStyle:"italic", fontSize:20, color:"#E89B7B", marginBottom:6 }}>You're all set{ biz.ownerName ? `, ${biz.ownerName.split(" ")[0]}` : ""}.</div>
                <div style={{ fontSize:14, color:"rgba(229,217,210,0.75)", lineHeight:1.6 }}>Your answers were sent to Jennifer at WrenTech. She'll review everything and follow up within 24 hours — usually faster.</div>
              </div>
            )}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:12 }}>
              <Head title={`${biz.bizName || "Project"} summary`} />
              {summary && (
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={()=>{navigator.clipboard.writeText(summary);setCopied(true);setTimeout(()=>setCopied(false),2000);}} style={{ padding:"8px 16px", borderRadius:8, border:"1px solid rgba(229,217,210,0.2)", background:"transparent", color:"#C9BBAE", fontFamily:"'Inter',sans-serif", fontSize:12, cursor:"pointer" }}>{copied?"Copied":"Copy"}</button>
                  <button onClick={()=>window.print()} style={{ padding:"8px 16px", borderRadius:8, border:"1px solid rgba(229,217,210,0.2)", background:"transparent", color:"#C9BBAE", fontFamily:"'Inter',sans-serif", fontSize:12, cursor:"pointer" }}>Print</button>
                </div>
              )}
            </div>
            {summary && (
              <div style={{ background:"rgba(0,0,0,0.2)", borderRadius:12, padding:"24px 28px", whiteSpace:"pre-wrap", fontSize:13, lineHeight:1.85, color:"#E8D9D2", fontFamily:"'IBM Plex Mono','Courier New',monospace" }}>{summary}</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
