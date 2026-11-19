(function(){
var R={url:location.href,title:document.title,ready:document.readyState,ts:new Date().toISOString()};
function txt(e){return (e&&(e.innerText||e.textContent)||'').replace(/\s+/g,' ').trim();}
function vis(e){var s=getComputedStyle(e);if(s.display=='none'||s.visibility=='hidden')return false;var r=e.getBoundingClientRect();return r.width>0&&r.height>0;}
function nm(e){var a=e.getAttribute('aria-labelledby');if(a){var t=a.split(/\s+/).map(function(i){var x=document.getElementById(i);return x?txt(x):'';}).join(' ').trim();if(t)return t;}
 a=(e.getAttribute('aria-label')||'').trim();if(a)return a;
 if(e.id){var l=document.querySelector('label[for="'+CSS.escape(e.id)+'"]');if(l&&txt(l))return txt(l);}
 var p=e.closest('label');if(p&&txt(p))return txt(p);
 if(/^(submit|button|reset)$/i.test(e.type||'')&&e.value)return e.value;
 if(e.tagName=='INPUT'&&e.type=='image'&&e.alt)return e.alt;
 var t=txt(e);if(t)return t;
 var im=e.querySelectorAll('img[alt],svg[aria-label],svg title,[aria-label]');for(var i=0;i<im.length;i++){var v=im[i].getAttribute('alt')||im[i].getAttribute('aria-label')||im[i].textContent;if(v&&v.trim())return v.trim();}
 if(e.title)return e.title; if(e.placeholder)return 'PLACEHOLDER_ONLY:'+e.placeholder; return '';}
// landmarks + headings
var L={};['nav','main','article','header','aside','footer','section'].forEach(function(t){L[t]=document.querySelectorAll(t).length;});
['navigation','main','banner','contentinfo','complementary','search'].forEach(function(r){L['role_'+r]=document.querySelectorAll('[role="'+r+'"]').length;});
R.landmarks=L;
var hs=[].slice.call(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).filter(vis);
R.h1=hs.filter(function(h){return h.tagName=='H1';}).map(txt).slice(0,5);
var skips=[],prev=0;hs.forEach(function(h){var n=+h.tagName[1];if(prev&&n>prev+1)skips.push('h'+prev+'->h'+n+':'+txt(h).slice(0,40));prev=n;});
R.headingSkips=skips.slice(0,10);R.headingCount=hs.length;
// accessible names
var sel='button,a[href],input:not([type=hidden]),select,textarea,summary,[role=button],[role=link],[role=checkbox],[role=menuitem],[role=tab],[role=combobox],[role=switch]';
var ctrls=[].slice.call(document.querySelectorAll(sel)).filter(vis);
var unnamed=[],iconUnl=0,iconTot=0,ph=0;
ctrls.forEach(function(e){var n=nm(e);var icon=!txt(e)&&e.querySelector('svg,img,i,span');if(icon){iconTot++;}
 if(!n){unnamed.push(e.outerHTML.slice(0,140));if(icon)iconUnl++;} else if(n.indexOf('PLACEHOLDER_ONLY')==0)ph++;});
R.names={interactiveVisible:ctrls.length,unnamed:unnamed.length,unnamedSamples:unnamed.slice(0,8),iconControls:iconTot,iconUnlabeled:iconUnl,placeholderOnly:ph};
// fake buttons
var fake=[].slice.call(document.querySelectorAll('div[onclick],span[onclick],li[onclick],img[onclick],div[role=button],span[role=button],a:not([href])[role=button],a[href="#"],a[href^="javascript:"],a:not([href])')).filter(vis);
R.fakeButtons={count:fake.length,samples:fake.slice(0,6).map(function(e){return e.outerHTML.slice(0,120);}),roleButtonNoTabindex:[].slice.call(document.querySelectorAll('div[role=button]:not([tabindex]),span[role=button]:not([tabindex])')).length};
// tree integrity
R.ariaHiddenFocusable=[].slice.call(document.querySelectorAll('[aria-hidden=true]')).filter(function(e){return e.querySelector('a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])');}).length;
var valid='alert alertdialog application article banner blockquote button caption cell checkbox code columnheader combobox complementary contentinfo definition deletion dialog directory document emphasis feed figure form generic grid gridcell group heading img image insertion link list listbox listitem log main marquee math menu menubar menuitem menuitemcheckbox menuitemradio meter navigation none note option paragraph presentation progressbar radio radiogroup region row rowgroup rowheader scrollbar search searchbox separator slider spinbutton status strong subscript superscript switch tab table tablist tabpanel term textbox time timer toolbar tooltip tree treegrid treeitem'.split(' ');
R.invalidRoles=[].slice.call(document.querySelectorAll('[role]')).map(function(e){return e.getAttribute('role').split(' ')[0];}).filter(function(r){return valid.indexOf(r)<0;}).slice(0,10);
R.dupIds=(function(){var s={},d=0;[].forEach.call(document.querySelectorAll('[id]'),function(e){if(s[e.id])d++;s[e.id]=1;});return d;})();
// hooks
R.hooks={'data-testid':document.querySelectorAll('[data-testid]').length,'data-agent':document.querySelectorAll('[data-agent]').length,'data-test':document.querySelectorAll('[data-test],[data-qa],[data-cy]').length,ctrlsWithHook:ctrls.filter(function(e){return e.closest('[data-testid],[data-agent]');}).length,testidSamples:[].slice.call(document.querySelectorAll('[data-testid]')).slice(0,8).map(function(e){return e.getAttribute('data-testid');})};
// WebMCP
var mc={navigator:('modelContext' in navigator),document:('modelContext' in document),navType:typeof navigator.modelContext,docType:typeof document.modelContext};
try{var o=navigator.modelContext||document.modelContext;if(o&&o.tools)mc.tools=JSON.stringify(o.tools).slice(0,500);}catch(e){mc.err=String(e);}
var forms=[].slice.call(document.querySelectorAll('form'));mc.forms=forms.length;mc.formsWithToolname=forms.filter(function(f){return f.hasAttribute('toolname')||f.hasAttribute('tool-name');}).length;
R.webmcp=mc;
// head links
function links(q){return [].slice.call(document.querySelectorAll(q)).map(function(l){return (l.getAttribute('rel')||'')+'|'+(l.getAttribute('type')||'')+'|'+l.getAttribute('href');});}
R.canonical=links('link[rel=canonical]');R.alternates=links('link[rel=alternate],link[rel=ai-catalog],link[rel=service-desc],link[rel=describedby],link[rel=llms],link[rel="llms-txt"]');
R.metaRobots=[].slice.call(document.querySelectorAll('meta[name=robots],meta[name=googlebot]')).map(function(m){return m.content;});
// JSON-LD
var ld=[],ldErr=0,types=[];[].forEach.call(document.querySelectorAll('script[type="application/ld+json"]'),function(s){try{var j=JSON.parse(s.textContent);ld.push(j);}catch(e){ldErr++;}});
function walk(o){if(!o||typeof o!='object')return;if(Array.isArray(o)){o.forEach(walk);return;}if(o['@type'])types.push([].concat(o['@type']).join('+'));if(o['@graph'])walk(o['@graph']);for(var k in o)if(k!='@graph'&&typeof o[k]=='object')walk(o[k]);}
walk(ld);var body=txt(document.body);
var prods=[];function fp(o){if(!o||typeof o!='object')return;if(Array.isArray(o)){o.forEach(fp);return;}var t=[].concat(o['@type']||[]);if(t.indexOf('Product')>=0||t.indexOf('ProductGroup')>=0)prods.push(o);for(var k in o)if(typeof o[k]=='object')fp(o[k]);}fp(ld);
R.jsonld={blocks:ld.length,parseErrors:ldErr,types:types.slice(0,25),products:prods.slice(0,3).map(function(p){var off=[].concat(p.offers||(p.hasVariant&&p.hasVariant[0]&&p.hasVariant[0].offers)||[])[0]||{};var price=off.price||off.lowPrice;return {name:p.name,nameVisible:p.name?body.indexOf(p.name)>=0:null,price:price,priceVisible:price!=null?(body.indexOf(String(price))>=0||body.indexOf(Number(price).toFixed(2))>=0):null,availability:off.availability,sku:p.sku,brand:!!p.brand};})};
// facts in visible text
function c(re){var m=body.match(re);return m?m.length:0;}
R.visible={chars:body.length,price$:c(/\$\s?\d[\d,]*(\.\d\d)?/g),nicotine:c(/nicotine|tobacco|vape|e-?cig/gi),researchUse:c(/research use|not for human|for research|laboratory use/gi),healthClaim:c(/\b(cure|treat|treats|heal|weight loss|lose weight|fat loss|anti-aging|dosage|dose|inject)\b/gi),soldOut:c(/sold out|out of stock/gi),inStock:c(/in stock/gi),openingSoon:c(/opens soon|coming soon/gi),addToCart:c(/add to (cart|bag)/gi),contactForPrice:c(/contact (us )?for (pricing|price|a quote)|request (a )?quote|sign in .{0,20}pric|apply for trade pricing/gi)};
R.visible.healthClaimSamples=(body.match(/.{0,40}\b(cure|treat|treats|heal|weight loss|lose weight|fat loss|anti-aging|dosage|dose|inject)\b.{0,40}/gi)||[]).slice(0,5);
// walls / payments
R.walls={captchaIframes:[].slice.call(document.querySelectorAll('iframe')).map(function(f){return f.src;}).filter(function(s){return /recaptcha|hcaptcha|turnstile|challenges\.cloudflare|arkoselabs|funcaptcha/i.test(s);}),captchaDivs:document.querySelectorAll('.g-recaptcha,.h-captcha,.cf-turnstile,[data-sitekey]').length,cfChallenge:/Just a moment|cf-chl|Attention Required/i.test(document.title+document.documentElement.innerHTML.slice(0,4000)),dialogsOpen:[].slice.call(document.querySelectorAll('dialog[open],[role=dialog],[aria-modal=true]')).filter(vis).map(function(d){return txt(d).slice(0,120);})};
var srcs=[].slice.call(document.scripts).map(function(s){return s.src;}).join(' ');
R.payments={stripeJs:/js\.stripe\.com/.test(srcs),googlePay:/pay\.google\.com/.test(srcs),applePayApi:typeof window.ApplePaySession!='undefined',paymentRequestApi:typeof window.PaymentRequest!='undefined',linkMentions:c(/\bLink\b.{0,20}(pay|checkout)|pay with link/gi),walletButtons:document.querySelectorAll('[class*=apple-pay],[class*=google-pay],[class*=gpay],apple-pay-button,gpay-button').length};
// CLS (Safari has no layout-shift entries)
R.cls={supported:!!(window.PerformanceObserver&&PerformanceObserver.supportedEntryTypes&&PerformanceObserver.supportedEntryTypes.indexOf('layout-shift')>=0)};
return JSON.stringify(R);
})();
