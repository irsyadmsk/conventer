import { useEffect,useRef } from 'react'
declare global {interface Window {IrsyadsServiceNavigation?: {mount(target:HTMLElement,current:string,app?:string):()=>void}}}
export function SharedNavigation(){
 const ref=useRef<HTMLDivElement>(null)
 useEffect(()=>{if(ref.current)return window.IrsyadsServiceNavigation?.mount(ref.current,'ruang','Toolkit')},[])
 return <div ref={ref}/>
}
