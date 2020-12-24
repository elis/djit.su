import { ssr } from 'djitsu/utils/ssr'

const name = 'graze-fullstory'

export const server = {
  name,
  onRequest: ({ fsOrg, namespace = 'FS' }) => {
    return {
      fsOrg,
      namespace
    }
  },
  output: ({ fields: { fsOrg, namespace } }) => {
    if (!fsOrg) {
      console.warn(
        `Option "fsOrg" is missing from ${name} settings — fullystory not activated`
      )
      return ''
    }
    return [
      `
    <script>
      window['_fs_debug'] = false;
  window['_fs_host'] = 'fullstory.com';
  window['_fs_script'] = 'edge.fullstory.com/s/fs.js';
  window['_fs_org'] = '${fsOrg}';
  window['_fs_namespace'] = '${namespace}';
  (function(m,n,e,t,l,o,g,y){
      if (e in m) {if(m.console && m.console.log) { m.console.log('FullStory namespace conflict. Please set window["_fs_namespace"].');} return;}
      g=m[e]=function(a,b,s){g.q?g.q.push([a,b,s]):g._api(a,b,s);};g.q=[];
      o=n.createElement(t);o.async=1;o.crossOrigin='anonymous';o.src='https://'+_fs_script;
      y=n.getElementsByTagName(t)[0];y.parentNode.insertBefore(o,y);
      g.identify=function(i,v,s){g(l,{uid:i},s);if(v)g(l,v,s)};g.setUserVars=function(v,s){g(l,v,s)};g.event=function(i,v,s){g('event',{n:i,p:v},s)};
      g.anonymize=function(){g.identify(!!0)};
      g.shutdown=function(){g("rec",!1)};g.restart=function(){g("rec",!0)};
      g.log = function(a,b){g("log",[a,b])};
      g.consent=function(a){g("consent",!arguments.length||a)};
      g.identifyAccount=function(i,v){o='account';v=v||{};v.acctId=i;g(o,v)};
      g.clearUserCookie=function(){};
      g._w={};y='XMLHttpRequest';g._w[y]=m[y];y='fetch';g._w[y]=m[y];
      if(m[y])m[y]=function(){return g._w[y].apply(this,arguments)};
      g._v="1.2.0";
  })(window,document,window['_fs_namespace'],'script','user');
      </script>
      `
    ]
  }
}

export const app = {
  onLoad: () => {
    return {}
  },
  Wrapper: ({ children }) => {
    return children
  },
  expose: (plugin) => {
    if (ssr) return null
    const FS = window.FS
    if (!FS) {
      console.warn('Fullstory FS not loaded')
      return {}
    }

    const {
      options: { exposeName }
    } = plugin

    const n = exposeName || name

    return {
      [n]: {
        logEvent: (eventName, eventData) => FS.event(eventName, eventData),
        setProperty: (prop, value) => FS.setUserVars({ [prop]: value }),
        setProperties: (properties) => FS.setUserVars(properties),
        setUser: (props) =>
          props?.id &&
          FS.identify(props.id, {
            username: props.username
          })
      }
    }
  }
}
