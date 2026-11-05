function installGlyphSafe(c){if(c._glyphSafe)return;c._glyphSafe=true;const raw=c.fillText.bind(c);c.fillText=function(text,x,y,...rest){if(!/[$+=−•\x2f]/.test(text)){raw(text,x,y,...rest);return}let font=this.font,align=this.textAlign,runs=String(text).split(/([$+=−•\x2f])/).filter(Boolean),widths=runs.map(r=>{this.font=/^[$+=−•\x2f]$/.test(r)?font.replace('MotionInter','MotionSymbols'):font;return this.measureText(r).width}),width=widths.reduce((a,b)=>a+b,0),left=x-(align==='center'?width/2:align==='right'?width:0);this.textAlign='left';runs.forEach((r,i)=>{this.font=/^[$+=−•\x2f]$/.test(r)?font.replace('MotionInter','MotionSymbols'):font;raw(r,left,y);left+=widths[i]});this.font=font;this.textAlign=align;};}
// CPU port of Aurora control-point motion and clamped bicubic color interpolation.
const meshGrid=[["#05203A", "#06364A", "#084C4C", "#0C7C72", "#15957E"], ["#041A30", "#052C3E", "#073E42", "#0A7A68", "#1FA184"], ["#04192C", "#052836", "#063C3C", "#108C70", "#2BB187"], ["#051C2E", "#062E3A", "#07423E", "#0E8468", "#23A87E"], ["#031428", "#042630", "#053836", "#0B7660", "#189A74"]].map(row=>row.map(h=>[1,3,5].map(k=>parseInt(h.slice(k,k+2),16))));
const meshPoints=[
    { ax: 0.07, ay: 0.16, kx: 2, ky: 3, px: 0.0, py: 1.3, ck: 2, cp: 0.4, alt: "#04243A" },
    { ax: 0.12, ay: 0.20, kx: 3, ky: 2, px: 1.7, py: 4.1, ck: 3, cp: 2.2, alt: "#06424A" },
    { ax: 0.24, ay: 0.17, kx: 2, ky: 3, px: 3.4, py: 0.6, ck: 2, cp: 4.0, alt: "#1C9E8E" },
    { ax: 0.06, ay: 0.22, kx: 3, ky: 2, px: 5.0, py: 2.9, ck: 3, cp: 1.1, alt: "#072A44" },
    { ax: 0.13, ay: 0.18, kx: 2, ky: 3, px: 0.9, py: 5.4, ck: 2, cp: 3.3, alt: "#064E4A" },
    { ax: 0.22, ay: 0.24, kx: 3, ky: 2, px: 2.6, py: 1.1, ck: 3, cp: 5.1, alt: "#22A882" },
    { ax: 0.07, ay: 0.19, kx: 2, ky: 3, px: 4.3, py: 3.7, ck: 2, cp: 2.7, alt: "#052E42" },
    { ax: 0.11, ay: 0.24, kx: 3, ky: 2, px: 6.0, py: 0.2, ck: 3, cp: 0.8, alt: "#075246" },
    { ax: 0.25, ay: 0.17, kx: 2, ky: 3, px: 1.2, py: 4.8, ck: 2, cp: 4.6, alt: "#0A7C84" },
];
const cr=(a,b,c,d,t)=>.5*(2*b+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);
function drawBrandMesh(ctx,t,canvas){
 const g=canvas.getContext('2d'),w=canvas.width,h=canvas.height,phase=2*Math.PI*t/22;
 let px=[],py=[],colors=[],m=0;
 for(let j=0;j<5;j++){px[j]=[];py[j]=[];colors[j]=[];for(let i=0;i<5;i++){let x=i/4,y=j/4,col=meshGrid[j][i].slice();if(i>0&&i<4&&j>0&&j<4){let p=meshPoints[m++];x+=p.ax*.5*Math.sin(phase*p.kx+p.px);y-=p.ay*.5*Math.sin(phase*p.ky+p.py);let a=[1,3,5].map(k=>parseInt(p.alt.slice(k,k+2),16)),f=.5+.5*Math.sin(phase*p.ck+p.cp);col=col.map((v,k)=>v+(a[k]-v)*f)}px[j][i]=x;py[j][i]=y;colors[j][i]=col;}}
 const clamp=i=>Math.max(0,Math.min(4,i));
 function sample(field,u,v,ch){let fx=u*4,fy=v*4,i=Math.min(3,Math.floor(fx)),j=Math.min(3,Math.floor(fy)),rows=[],lo=255,hi=0;for(let d=-1;d<=2;d++){let vals=[];for(let e=-1;e<=2;e++){let z=field[clamp(j+d)][clamp(i+e)];z=ch===undefined?z:z[ch];vals.push(z);lo=Math.min(lo,z);hi=Math.max(hi,z)}rows.push(cr(...vals,fx-i))}let z=cr(...rows,fy-j);return ch===undefined?z:Math.max(lo,Math.min(hi,z));}
 let n=32,verts=[];for(let y=0;y<=n;y++)for(let x=0;x<=n;x++){let u=x/n,v=y/n;verts.push([sample(px,u,v)*w,sample(py,u,v)*h,...[0,1,2].map(k=>sample(colors,u,v,k))]);}
 let im=g.createImageData(w,h),data=im.data;
 function tri(a,b,c){let den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);if(Math.abs(den)<.001)return;let minX=Math.max(0,Math.floor(Math.min(a[0],b[0],c[0]))),maxX=Math.min(w-1,Math.ceil(Math.max(a[0],b[0],c[0]))),minY=Math.max(0,Math.floor(Math.min(a[1],b[1],c[1]))),maxY=Math.min(h-1,Math.ceil(Math.max(a[1],b[1],c[1])));for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){let u=((b[1]-c[1])*(x+.5-c[0])+(c[0]-b[0])*(y+.5-c[1]))/den,v=((c[1]-a[1])*(x+.5-c[0])+(a[0]-c[0])*(y+.5-c[1]))/den,z=1-u-v;if(u>=-.001&&v>=-.001&&z>=-.001){let k=(y*w+x)*4;for(let ch=0;ch<3;ch++)data[k+ch]=a[ch+2]*u+b[ch+2]*v+c[ch+2]*z;data[k+3]=255}}}
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){let a=y*(n+1)+x;tri(verts[a],verts[a+n+1],verts[a+1]);tri(verts[a+1],verts[a+n+1],verts[a+n+2]);}
 g.putImageData(im,0,0);ctx.imageSmoothingEnabled=true;ctx.drawImage(canvas,0,0,1280,720);
}
/* Pure frame choreography. Shared by HTML and MP4 renderer. */
function drawMotion(c,t,assets,concept=0){
installGlyphSafe(c);const W=1280,H=720,M='#97FCE4',L='#E2F6A1',D='#8FA3A6',R='#F26D71';
const clamp=x=>Math.max(0,Math.min(1,x)),s=(a,b)=>{let x=clamp((t-a)/(b-a));return x*x*x*(x*(x*6-15)+10)},mix=(a,b,p)=>a+(b-a)*p;
const txt=(v,x,y,size=24,col='#FAFAFA',align='center',alpha=1)=>{c.globalAlpha=alpha;c.fillStyle=col;c.font=`500 ${size*(.97+.03*alpha)}px MotionInter`;c.textAlign=align;c.fillText(v,x,y+(1-alpha)*12);c.globalAlpha=1};
const line=(pts,col,width=2,alpha=1)=>{c.globalAlpha=alpha;c.strokeStyle=col;c.lineWidth=width;c.beginPath();pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.stroke();c.globalAlpha=1};
const dot=(x,y,r,col,a=1)=>{c.globalAlpha=a;c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();c.globalAlpha=1};
const ease=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10)};
drawBrandMesh(c,t,assets.mesh);
// Scene 02/03 brand lockup in the reserved top-left margin.
if(t>=2&&t<18.3){let brandAlpha=s(2,2.5)*(1-s(17.8,18.3));c.save();c.globalAlpha=brandAlpha;c.drawImage(assets.logo,34,27,160,assets.logo.height/assets.logo.width*160);c.restore();}

c.save();
const zoom=concept===1?1+.045*Math.sin(Math.PI*clamp(t/22)):1;c.translate(640,360);c.scale(zoom,zoom);c.translate(-640,-360);
if(t>=2&&t<11){c.save();c.globalAlpha=s(2,2.4)*(1-s(10,11));c.fillStyle='#052C3E22';c.strokeStyle='#97FCE42E';c.lineWidth=1;c.beginPath();c.roundRect(110,155,1055,410,26);c.fill();c.stroke();c.restore();}
// Scene 01 is a separate title composition; no chart lines behind it.
if(t<2){
 const a=s(0,.4)*(1-s(1.65,2));
 c.globalAlpha=a;c.drawImage(assets.logo,477,239+(1-a)*12,300,assets.logo.height/assets.logo.width*300);c.globalAlpha=1;
 txt('ARBITRAGE TRADING',640,364,58,'#FAFAFA','center',a);
 txt('One asset. Two prices. One opportunity.',640,417,21,M,'center',a);
 line([[540,457],[740,457]],M,2,a);
}
const chartOpacity=s(2,2.4)*(1-s(10,11));
const clock=10,start=245,end=1040,revealEnd=mix(start,end,s(2.25,6.5));
function price(x,k){let u=(x-start)/(end-start);return 365+Math.sin(u*11-clock*.45)*55+Math.sin(u*23+clock*.26)*16+(k?1:-1)*(Math.sin(u*10+clock*.7)*37+15);}
function chartPoint(x,k){return [x,price(x,k)];}
if(t>=2&&t<11){
let a=chartOpacity;
for(let y=220;y<=520;y+=60){line([[245,y],[1040,y]],'#25403F',1,a*.7);let value='$'+(50+(365-y)/100).toFixed(2);txt(value,1067,y+5,14,'#FAFAFA','left',a);}
line([[1052,205],[1052,535]],'#42615D',1,a);
txt('USD',1067,184,12,M,'left',a);
for(let x=245;x<=1040;x+=99)line([[x,205],[x,535]],'#25403F',1,a*.5);
// Frozen paths, progressively revealed. Hatch is clipped to the same drawing head.
if(t>2.25){c.save();c.beginPath();c.rect(start,180,revealEnd-start,390);c.clip();
c.beginPath();for(let x=start;x<=end;x+=4)c.lineTo(x,price(x,0));for(let x=end;x>=start;x-=4)c.lineTo(x,price(x,1));c.closePath();c.clip();c.globalAlpha=chartOpacity;c.fillStyle='#97FCE410';c.fillRect(start,180,end-start,390);for(let x=-400;x<1500;x+=13)line([[x,560],[x+380,180]],M,1,.45*chartOpacity);c.restore();}
for(let k=0;k<2;k++){let pts=[];for(let x=start;x<revealEnd;x+=4)pts.push(chartPoint(x,k));pts.push(chartPoint(revealEnd,k));line(pts,k?L:M,3,chartOpacity);let p=chartPoint(revealEnd,k);dot(...p,4,k?L:M,chartOpacity);}
txt('$HYPE PRICE',640,115,36,M,'center',chartOpacity);
// Platform names sit beside each line's fixed origin, outside the plot.
for(let k=0;k<2;k++)txt(k?'Uniswap':'Hyperliquid',230,price(start,k)+5,16,k?L:M,'right',chartOpacity);

txt('Same asset. Different prices.',640,601,30,M,'center',s(2,2.6)*(1-s(6.7,7.1)));
txt('BUY LOW + SELL HIGH = ARBITRAGE',640,610,28,M,'center',s(7,7.4)*chartOpacity);
txt('Matched BUY / SELL • same timestamp',640,641,15,D,'center',s(7,7.4)*chartOpacity);
if(t>5&&t<7.2){
 const a=s(5,5.4)*(1-s(6.8,7.2));
 // Central callout, with leaders ending inside two hatched regions.
 const anchors=[560,790];
 for(let x of anchors){let y=(price(x,0)+price(x,1))/2;line([[640,270],[x,292],[x,y]],M,1.5,a);dot(x,y,3,M,a);let dir=y>292?1:-1;line([[x-5,y-dir*8],[x,y],[x+5,y-dir*8]],M,1.5,a);}
 c.globalAlpha=a;c.fillStyle='#0F2122';c.strokeStyle=M;c.lineWidth=1;c.beginPath();c.roundRect(569,232,142,38,9);c.fill();c.stroke();c.globalAlpha=1;
 txt('PRICE GAP',640,257,17,M,'center',a);
}
// Every pair uses the same X and same appearance timestamp.
for(let i=0;i<3;i++){let q=clamp((t-(7+i*.85))/.18),fade=1-ease((t-(8.1+i*.85))/.5);if(!q||!fade)continue;let x=[320,560,820][i],a=price(x,0),b=price(x,1),lo=Math.max(a,b),hi=Math.min(a,b);line([[x,hi],[x,lo]],M,1.2,q*fade*.6);for(let y of [lo,hi]){dot(x,y,6,M,q*fade);c.globalAlpha=q*fade*(1-((t-7-i*.85)% .7)/.7);c.strokeStyle=M;c.lineWidth=1;c.beginPath();c.arc(x,y,10+((t-7-i*.85)%.7)*12,0,7);c.stroke();c.globalAlpha=1;}for(let [label,y] of [['SELL',hi-37],['BUY',lo+37]]){c.globalAlpha=q*fade;c.fillStyle='#0F2122';c.strokeStyle=M;c.lineWidth=1;c.beginPath();c.roundRect(x-41,y-19,82,31,7);c.fill();c.stroke();c.globalAlpha=1;txt(label,x,y+3,16,M,'center',q*fade);}}
}
// Persistent gap fragments: exact source samples, never replaced on transition.
const N=640,logoTargets=assets.targets||[];
for(let i=0;i<N;i++){
let col=i%80,row=Math.floor(i/80),x=mix(start,end,col/79),group=Math.min(2,Math.floor(col/27)),j=Math.floor(i/3),y=mix(price(x,0),price(x,1),(row+.5)/8);
let contraction=ease((t-11.1-group*.13)/1.6),gx=[340,650,970][group],gy=[340,400,330][group];x=mix(x,gx+(j%8-3.5)*5,contraction);y=mix(y,gy+(Math.floor(j/8)-3.5)*5,contraction);
let travel=ease((t-12.7-group*.12-(j%9)*.06)/3.8),cost=i%5===0;
let destX=cost?1050:640,destY=cost?540:420;
x=mix(x,destX,travel);y=mix(y,destY,travel)-Math.sin(travel*Math.PI)*(cost?10:80);
let opacity=s(10,11)*(cost?1-ease((travel-.6)/.4):1-ease((travel-.93)/.07));
if(t>=18){
 const mask=assets.mesh.getContext('2d');
 if(!assets.mesh._bagDots){mask.beginPath();mask.moveTo(-29,-70);mask.bezierCurveTo(-35,-93,-52,-107,-42,-115);mask.quadraticCurveTo(0,-99,42,-115);mask.bezierCurveTo(52,-107,35,-93,29,-70);mask.bezierCurveTo(62,-31,94,-3,85,45);mask.bezierCurveTo(78,88,-78,88,-85,45);mask.bezierCurveTo(-94,-3,-62,-31,-29,-70);mask.closePath();
 let points=[];for(let j=0;points.length<640&&j<20000;j++){let xx=-88+((j*73.137)%176),yy=-117+((j*39.713)%205);if(mask.isPointInPath(xx,yy))points.push([xx,yy]);}assets.mesh._bagDots=points;}
 const source=assets.mesh._bagDots[i%assets.mesh._bagDots.length],hash=(Math.sin(Math.floor(source[0]/8)*127.1+Math.floor(source[1]/8)*311.7)*43758.5453)%1,seed=hash-Math.floor(hash),age=(t-18-seed*.9)/1.1,p=ease(age),target=logoTargets[i%logoTargets.length]||[640,330];
 x=mix(640+source[0],target[0],p)+Math.sin(p*Math.PI)*18;y=mix(425+source[1],target[1],p)-Math.sin(p*Math.PI)*25;opacity=clamp(age*12)*(1-s(19.7,20.15));
}
if(opacity>.001)dot(x,y,mix(1.6,2.4,contraction),cost&&t>13&&t<18?R:M,opacity);
}
if(t>11&&t<18.2){txt('PRICE GAP',400,151,22,M,'center',s(11,11.5)*(1-s(17.6,18.2)));txt('−',520,151,24,R,'center',s(13,13.5)*(1-s(17.6,18.2)));txt('COSTS',640,151,22,R,'center',s(13,13.5)*(1-s(17.6,18.2)));txt('=',760,151,24,'#FAFAFA','center',s(13.5,14)*(1-s(17.6,18.2)));txt('NET PROFIT',880,151,22,'#FAFAFA','center',s(13.5,14)*(1-s(17.6,18.2)));if(t<15.5){line([[920,480],[970,530],[1040,530]],R,1,s(13,13.5)*(1-s(15,15.5)));txt('Trading costs',1040,563,15,R,'center',s(13,13.5)*(1-s(15,15.5)));}}
// One bag, from accumulation through distribution to logo collapse.
let bagA=s(14,14.7)*(1-s(18.9,19.2));if(bagA>0){let size=mix(.42,1,s(14,17.8)),up=0,bx=640,by=425;c.save();c.globalAlpha=bagA;c.translate(bx,by);c.scale(size,size);if(t>=18){c.beginPath();let dissolve=clamp((t-18)/.9);for(let yy=-120;yy<96;yy+=8)for(let xx=-96;xx<96;xx+=8){let h=Math.sin(Math.floor((xx+4)/8)*127.1+Math.floor((yy+4)/8)*311.7)*43758.5453;h-=Math.floor(h);if(h>=dissolve)c.rect(xx,yy,8.1,8.1);}c.clip();}c.fillStyle='#173132';c.strokeStyle=M;c.lineWidth=2;c.beginPath();c.moveTo(-29,-70);c.bezierCurveTo(-35,-93,-52,-107,-42,-115);c.quadraticCurveTo(0,-99,42,-115);c.bezierCurveTo(52,-107,35,-93,29,-70);c.bezierCurveTo(62,-31,94,-3,85,45);c.bezierCurveTo(78,88,-78,88,-85,45);c.bezierCurveTo(-94,-3,-62,-31,-29,-70);c.closePath();c.fill();c.stroke();line([[-32,-70],[32,-70]],M,4);c.drawImage(assets.mark,-26,-20,52,52);c.restore();txt('NET PROFIT',640,by+112*size,20,'#FAFAFA','center',bagA*(1-s(18,18.4)));}
if(t>19.7){let a=s(19.7,20.15);c.globalAlpha=a;c.drawImage(assets.logo,396,239,450,assets.logo.height/assets.logo.width*450);c.globalAlpha=1;txt('ARBITRAGE TRADING',640,395,28,'#FAFAFA','center',s(20,20.7));txt('COMING SOON',640,452,18,L,'center',s(21,21.5));}
c.restore();
}
if(typeof module!=='undefined')module.exports={drawMotion};
