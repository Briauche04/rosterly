import { Header, Footer } from "../layout";
import { STR, useLang } from "../i18n";
export default function Page({searchParams}:any){ const lang=useLang(searchParams); const t=STR[lang];
return (<div className={t.dir==='rtl'?'rtl':''}><Header lang={lang}/><section className="hero"><div className="container"><h1 className="title">{t['team']}</h1><p className="subtitle">{t.empty}</p><div className="card" style={{ marginTop: 16 }}>#team • placeholder</div></div></section><Footer/></div>); }
