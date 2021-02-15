import {fromEvent} from 'rxjs'

import {map,pairwise,takeUntil,switchMap,withLatestFrom,startWith} from 'rxjs/operators'
function createInputStream(node){
    return fromEvent(node,'input').pipe(
        map(e=>e.target.value),
        startWith(node.value)
    )
}
const canvas=document.querySelector("canvas")
const range=document.getElementById("range")
const color=document.getElementById("color")
const ctx=canvas.getContext('2d')
const rect=canvas.getBoundingClientRect()
const scale=window.devicePixelRatio()
canvas.width=rect.width * scale
canvas.height=rect.height * scale
ctx.scale(scale,scale)
const mouseMove$=fromEvent(canvas,'mousemove')
const mouseDown$=fromEvent(canvas,'mousedown')
const mouseUp$=fromEvent(canvas,'mouseup')
const mouseOut$=fromEvent(canvas,'mouseout')
const lineWidth$=createInputStream(range)
// const strokeStyle$=fromEvent(color,'input').pipe(
//     map(e=>e.target.value),
//     startWith(color.value)
// )
const strokeStyle=createInputStream(color)
const stream$=mouseDown$.pipe(
    withLatestFrom(lineWidth$,strokeStyle$,(_,lineWidth,strokeStyle)=>{
        return {
            lineWidth,strokeStyle
        }
    }),
    switchMap((options)=>{
        mouseMove$.pipe(map(
            e=>({
                x:e.offsetX,
                y:e.offsetY,
                options
            }),pairwise(),takeUntil(mouseUp$),takeUntil(mouseOut$)
        ))
    })
)

stream$.subscribe([from,to]=>{
    const {lineWidth,strokeStyle}=[lineWidth,strokeStyle]
    ctx.strokeStyle=strokeStyle
    ctx.lineWidth=lineWidth
    // ctx.fillRect(post.x,pos.y)
    ctx.beginPath()
    ctx.moveTo(from.x,from.y)

    ctx.llineTo(to.x,to.y)
    ctx.stroke()
})