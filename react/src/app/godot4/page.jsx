'use client'

import * as styles from "./styles.module.css"
import Engine from "../../../../build/index.js"
import dynamic from "next/dynamic"
import assert from "browser-assert"
import { useRef, useEffect } from 'react'

function Page() {
    const statusRef = useRef(null);
    const progressRef = useRef(null);
    const noticeRef = useRef(null);

    return (
        <html lang="en" id="html">
            <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0" />
                <title>godot4webexport</title>
                <link id="-gd-engine-icon" rel="icon" type="image/png" href="index.icon.png" />
                <link rel="apple-touch-icon" href="index.apple-touch-icon.png" />
            </head>
            
            <body id="body">
                <canvas id="canvas">
                    Your browser does not support the canvas tag.
                </canvas>

                <noscript>
                    Your browser does not support JavaScript.
                </noscript>

                <div id="status" ref={statusRef}>
                    <img id="status-splash" src="index.png" alt="" />
                    <progress id="status-progress" ref={progressRef}></progress>
                    <div id="status-notice" ref={noticeRef}></div>
                </div>
                <script>
                    (function() {
                        LoadEngine(statusRef, progressRef, noticeRef)
                    }());
                </script>

            </body>
        </html>
    );
}

function LoadEngine(statusRef, progressRef, noticeRef) {


    let initializing = true;
    let statusMode = '';

    function setStatusMode(mode) {
        if(statusRef.current === null || progressRef.current === null || noticeRef.current === null) {
            return;
        }

        if (statusMode === mode || !initializing) {
            return;
        }
        if (mode === 'hidden') {
            statusRef.current.remove();
            initializing = false;
            return;
        }
        statusRef.current.style.visibility = 'visible';
        progressRef.current.style.display = mode === 'progress' ? 'block' : 'none';
        noticeRef.current.style.display = mode === 'notice' ? 'block' : 'none';
        statusMode = mode;
    }

    function setStatusNotice(text) {
        while (noticeRef.current.lastChild) {
            noticeRef.current.removeChild(noticeRef.current.lastChild);
        }
        const lines = text.split('\n');
        lines.forEach((line) => {
            noticeRef.current.appendChild(document.createTextNode(line));
            noticeRef.current.appendChild(document.createElement('br'));
        });
    }

    function displayFailureNotice(err) {
        const msg = err.message || err;
        console.error(msg);
        setStatusNotice(msg);
        setStatusMode('notice');
        initializing = false;
    }

    setStatusMode('progress');
    const GODOT_CONFIG = {"args":[],"canvasResizePolicy":2,"ensureCrossOriginIsolationHeaders":true,"executable":"index","experimentalVK":false,"fileSizes":{"index.pck":30768,"index.wasm":40944965},"focusCanvas":true,"gdextensionLibs":[]};
    var engine;

    useEffect(() => {
        if(statusRef.current === null || progressRef.current === null || noticeRef.current === null) {
            return;
        }
        engine = new Engine(GODOT_CONFIG);
        
        engine.startGame({
            'onProgress': function (current, total) {
                if (current > 0 && total > 0) {
                    progressRef.current.value = current;
                    progressRef.current.max = total;
                } else {
                    progressRef.current.removeAttribute('value');
                    progressRef.current.removeAttribute('max');
                }
            },
        }).then(() => {
            setStatusMode('hidden');
        }, displayFailureNotice);

    }, [statusRef.current, progressRef.current, noticeRef.current, engine]);
}

const csrPage = dynamic(() => Promise.resolve(Page), {
    ssr: false,
  })

export default csrPage;