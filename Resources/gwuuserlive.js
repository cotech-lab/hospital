(function(g,e,o){function l(){var b=e.getElementsByTagName("script"),b=b[b.length-1].src,b=b.replace("wiziCore/helpers/userlive.js","live.php");return b=b.replace("live/userlive.js","live.php")}g.jqSimpleGrid||(g.jqSimpleGrid={});var h=g.acInitParametrsObject||{forms:[],clientUrl:l(),userPathParams:{}};g.acGetLiveUrl=l;g.acGetPathParams=function(){return h.userPathParams};g.acPrefetchScripts=function(){var b=e.createElement("iframe");b.setAttribute("frameBorder",0);b.setAttribute("width",0);b.setAttribute("height",
0);var d=h.clientUrl.replace("live.php","prefill.php?trsdf"),d=d.indexOf("?")>0?d.slice(0,d.indexOf("?")):d;b.setAttribute("src",d);b.style.display="none";b.style.visibility="hidden";e.body.appendChild(b)};g.waInitForm=function(b,d,m,l,q,s,t){function p(){var a=b,c=n,d=e.getElementById(j);if(d!=null){d.acInitParametrsObject=h;var g=!1,i=h.customUrl||h.clientUrl;i.indexOf("?")==-1&&i.indexOf("live.php")==-1&&i.indexOf("live.html")==-1&&(g=!0);g?i+=a+"?":(i+=i.indexOf("?")==-1?"?":"&",i+="formId="+
a);for(var f in c)c[f]&&f!="formId"&&(i+="&"+f+"="+c[f]);d.setAttribute("src",i)}}m==o&&(m="100%");d==o&&(d="100%");h.customUrl=t;for(var n={},f=arguments.length,a=4;a<f;a++)n["arg"+(a-4)]=arguments[a];for(var f=g.location.search.substring(1).split("&"),u=f.length,a=0;a<u;a++){var r=f[a].split("=");n[r[0]]=r[1]}if(l!=o)try{var k=JSON.stringify(l),k=escape(k);n.inputParams=k}catch(v){acDebugger.systemLog("convert userLive input params error",v)}var k=0,j="waInitFormiFramePlace_"+b,f=!1;do{f=!1;j="waInitFormiFramePlace_"+
b+(k==0?"":k);for(a in h.forms)if(h.forms[a].frameId==j){f=!0;break}k++}while(f===!0);a='<iframe id="'+j+'" name="'+j+'"  scrolling="auto" frameBorder="0" hspace="0" vspace="0" align="top" width="'+d+'" height="'+m+'" allowtransparency="true" style="background-color:transparent">Browser not support iframes</iframe>';if(q==o)e.write(a);else{var c=e.createElement("iframe");c.setAttribute("frameBorder",0);c.setAttribute("allowTransparency",!0);c.setAttribute("id",j);c.setAttribute("name",j);c.setAttribute("scrolling",
"auto");c.setAttribute("hspace",0);c.setAttribute("vspace",0);c.setAttribute("align","top");c.setAttribute("width",d);c.setAttribute("height",m);c.style.backgroundColor="transparent";a=e.getElementById(q);if(a!=null){for(;a.childNodes.length;)a.removeChild(a.firstChild);a.appendChild(c)}else acDebugger.systemLog("can't detect htmlContainerId",q)}s&&(n.debug=!0);h.forms.push({formId:b,frameId:j,width:d,height:m});e.readyState==="complete"?p():e.readyState==="loaded"?p():e.addEventListener?e.addEventListener("DOMContentLoaded",
function(){p()},!1):e.attachEvent&&e.attachEvent("onreadystatechange",function(){p()});return c}})(window,document);