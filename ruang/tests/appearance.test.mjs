import test, { afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { sharedAppearance, mergeAccountAppearance, ecosystemUrl, SHARED_PALETTE } from '../src/lib/appearance.ts'

const original = Object.fromEntries(['document','window','localStorage'].map(key => [key,Object.getOwnPropertyDescriptor(globalThis,key)]))
const defaults = { theme:'system',palette:'krem',sound:false,motion:'system',autoSave:false,weeklyAi:true,apma:{school:{name:'Keep original'}} }
function setup(cookie='', explicit=false) {
 globalThis.document={cookie}
 globalThis.window={__irsyadsHadAppearance:explicit,IrsyadsLanguage:{preferredLanguage:()=> 'ar'}}
 globalThis.localStorage={getItem:()=>null}
}
afterEach(()=>{for(const [key,value] of Object.entries(original)){if(value)Object.defineProperty(globalThis,key,value);else delete globalThis[key]}})
test('all legacy palette ids have a shared counterpart',()=>{
 assert.deepEqual(Object.values(SHARED_PALETTE),['krem','forest','ocean','royal','aurora','earth'])
 for(const [old,current] of Object.entries(SHARED_PALETTE)){setup('irsyads-appearance-palette='+current);assert.equal(sharedAppearance(defaults).palette,old)}
})
test('shared appearance changes only UI fields',()=>{
 setup('irsyads-appearance-theme=dark; irsyads-appearance-palette=ocean')
 const result=sharedAppearance(defaults)
 assert.equal(result.theme,'dark');assert.equal(result.palette,'samudra')
 assert.deepEqual(result.apma,defaults.apma);assert.equal(result.sound,false);assert.equal(result.autoSave,false)
})
test('account appearance remains the fallback when no explicit shared choice exists',()=>{
 setup('irsyads-appearance-theme=system; irsyads-appearance-palette=krem')
 const result=mergeAccountAppearance(defaults,{theme:'dark',palette:'hutan',sound:true})
 assert.equal(result.theme,'dark');assert.equal(result.palette,'hutan');assert.equal(result.sound,true)
})
test('explicit choice beats delayed account response, preserving other account preferences',()=>{
 setup('irsyads-appearance-theme=light; irsyads-appearance-palette=ocean',true)
 const result=mergeAccountAppearance(defaults,{theme:'dark',palette:'hutan',sound:true})
 assert.equal(result.theme,'light');assert.equal(result.palette,'samudra');assert.equal(result.sound,true)
})
test('a choice arriving from another subdomain also beats a delayed account response',()=>{
 setup('irsyads-appearance-theme=dark; irsyads-appearance-palette=royal')
 const result=mergeAccountAppearance(defaults,{theme:'light',palette:'hutan'})
 assert.equal(result.theme,'dark');assert.equal(result.palette,'senja')
})
test('canonical account palette is adapted without changing its other fields',()=>{
 setup();const result=mergeAccountAppearance(defaults,{palette:'forest',autoSave:true})
 assert.equal(result.palette,'hutan');assert.equal(result.autoSave,true)
})
test('blocked storage and unknown preference values retain valid fallback',()=>{
 setup('irsyads-appearance-theme=invalid; irsyads-appearance-palette=invalid')
 globalThis.localStorage.getItem=()=>{throw Error('blocked')}
 assert.deepEqual(sharedAppearance(defaults),defaults)
})
test('return to site preserves Arabic; unsupported app destinations keep actual routes',()=>{
 setup()
 assert.equal(ecosystemUrl('site','https://irsyads.com',['id','en','ar'],'/apps'),'https://irsyads.com/ar/apps')
 assert.equal(ecosystemUrl('verify','https://verify.irsyads.com',['id','en','ar']),'https://verify.irsyads.com/?lang=ar')
 assert.equal(ecosystemUrl('letters','https://letters.irsyads.com',['id','en']),'https://letters.irsyads.com/')
})

test('English uses canonical root while explicit Indonesian and Arabic retain their prefixes',()=>{
 setup();
 for(const lang of ['en','id','ar',null]){
  globalThis.window.IrsyadsLanguage.preferredLanguage=()=>lang;
  const prefix=lang===null||lang==='en'?'':'/'+lang;
  assert.equal(ecosystemUrl('site','https://irsyads.com',['id','en','ar'],'/about'),'https://irsyads.com'+prefix+'/about');
  assert.equal(ecosystemUrl('site','https://irsyads.com',['id','en','ar']),'https://irsyads.com'+prefix+'/');
 }
})
