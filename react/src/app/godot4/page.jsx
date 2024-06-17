'use client'

import * as styles from "./styles.module.css"
import Engine from "./index.js"

export default function Page() {
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

                <div id="status">
                    <img id="status-splash" src="index.png" alt="" />
                    <progress id="status-progress"></progress>
                    <div id="status-notice"></div>
                </div>
                <script src="index.js">
                    (function() {
                        LoadEngine()
                    }());
                </script>

            </body>
        </html>
    );
}

function LoadEngine() {
    const GODOT_CONFIG = {"args":[],"canvasResizePolicy":2,"ensureCrossOriginIsolationHeaders":true,"executable":"index","experimentalVK":false,"fileSizes":{"index.pck":30768,"index.wasm":40944965},"focusCanvas":true,"gdextensionLibs":[]};
    const GODOT_THREADS_ENABLED = true;
    const engine = new Engine(GODOT_CONFIG);

    const statusOverlay = document.getElementById('status');
    const statusProgress = document.getElementById('status-progress');
    const statusNotice = document.getElementById('status-notice');

    let initializing = true;
    let statusMode = '';

    function setStatusMode(mode) {
        if (statusMode === mode || !initializing) {
            return;
        }
        if (mode === 'hidden') {
            statusOverlay.remove();
            initializing = false;
            return;
        }
        statusOverlay.style.visibility = 'visible';
        statusProgress.style.display = mode === 'progress' ? 'block' : 'none';
        statusNotice.style.display = mode === 'notice' ? 'block' : 'none';
        statusMode = mode;
    }

    function setStatusNotice(text) {
        while (statusNotice.lastChild) {
            statusNotice.removeChild(statusNotice.lastChild);
        }
        const lines = text.split('\n');
        lines.forEach((line) => {
            statusNotice.appendChild(document.createTextNode(line));
            statusNotice.appendChild(document.createElement('br'));
        });
    }

    function displayFailureNotice(err) {
        const msg = err.message || err;
        console.error(msg);
        setStatusNotice(msg);
        setStatusMode('notice');
        initializing = false;
    }

    const missing = Engine.getMissingFeatures({
        threads: GODOT_THREADS_ENABLED,
    });

    if (missing.length !== 0) {
        if (GODOT_CONFIG['serviceWorker'] && GODOT_CONFIG['ensureCrossOriginIsolationHeaders'] && 'serviceWorker' in navigator) {
            // There's a chance that installing the service worker would fix the issue
            Promise.race([
                navigator.serviceWorker.getRegistration().then((registration) => {
                    if (registration != null) {
                        return Promise.reject(new Error('Service worker already exists.'));
                    }
                    return registration;
                }).then(() => engine.installServiceWorker()),
                // For some reason, `getRegistration()` can stall
                new Promise((resolve) => {
                    setTimeout(() => resolve(), 2000);
                }),
            ]).catch((err) => {
                console.error('Error while registering service worker:', err);
            }).then(() => {
                window.location.reload();
            });
        } else {
            // Display the message as usual
            const missingMsg = 'Error\nThe following features required to run Godot projects on the Web are missing:\n';
            displayFailureNotice(missingMsg + missing.join('\n'));
        }
    } else {
        setStatusMode('progress');
        engine.startGame({
            'onProgress': function (current, total) {
                if (current > 0 && total > 0) {
                    statusProgress.value = current;
                    statusProgress.max = total;
                } else {
                    statusProgress.removeAttribute('value');
                    statusProgress.removeAttribute('max');
                }
            },
        }).then(() => {
            setStatusMode('hidden');
        }, displayFailureNotice);
    }
}