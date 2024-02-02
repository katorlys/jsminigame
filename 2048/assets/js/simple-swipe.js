/*
 * simple-swipe.js - v1.0.0-alpha01
 * Vanilla Javascript swipe event and mouse swipe event.
 * https://github.com/katorlys/simple-swipe.js
 * 
 * Copyright (c) 2024 Katorly Lab (https://github.com/katorlys)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

"use strict"

let startX, startY, endX, endY, castX, castY = 0
let direction = ""
let length = 0
let threshold = 10

document.addEventListener('touchstart', touchStartEvent, false)
document.addEventListener('touchend', touchEndEvent, false)

function checkDirection(e) {
    castX = startX - endX
    castY = startY - endY
    if (Math.abs(castX) < threshold && Math.abs(castY) < threshold) return
    if (Math.abs(startX - endX) > Math.abs(startY - endY)) {
        if (startX > endX) direction = "left"
        else direction = "right"
    } else {
        if (startY > endY) direction = "up"
        else direction = "down"
    }
    length = Math.sqrt(Math.pow(castX, 2) + Math.pow(castY, 2))
    
    e.target.dispatchEvent(new CustomEvent('swipe', {
        bubbles: true,
        cancelable: true,
        detail: {
            dir: direction,
            length: length,
            startX: startX,
            startY: startY,
            endX: endX,
            endY: endY,
            castX: castX,
            castY: castY
        }
    }))
}

function touchStartEvent(e) {
    startX = e.touches[0].clientX
    startY = e.touches[0].clientY
}

function touchEndEvent(e) {
    endX = e.changedTouches[0].clientX
    endY = e.changedTouches[0].clientY
    checkDirection(e)
}
