'use client';

import React, { useEffect, useState, useRef } from 'react';

declare global {
  interface Window {
    Engine?: any;
  }
}

const GODOT_CONFIG = {"args":[],"canvasResizePolicy":2,"ensureCrossOriginIsolationHeaders":true,"executable":"index","experimentalVK":false,"fileSizes":{"index.pck":348400,"index.wasm":48103538},"focusCanvas":true,"gdextensionLibs":[]};

const GodotGameTest = () => {
    const [engineLoaded, setEngineLoaded] = useState(false);
    const canvasRef = useRef(null);
    const [wasmInstance, setWasmInstance] = useState<any>(null);

    useEffect(() => {
      const fetchWasm = async () => {
        try {
          const response = await fetch('/index.wasm');
          const wasmBytes = await response.arrayBuffer();
          const wasmModule = await WebAssembly.instantiate(wasmBytes, {});
          setWasmInstance(wasmModule.instance);
        } catch (error) {
          console.error('Error loading WASM module:', error);
        }
      };

      fetchWasm();
    }, []);

    useEffect(()=>{
      console.log("wasm is here!", wasmInstance)
    }, [wasmInstance])

    useEffect(() => {
      const loadEngineScript = () => {
        // Function to check if 'Engine' is available
        const checkEngineAvailability = () => {
          return new Promise<void>((resolve)=> {
            if (window.Engine) {
                resolve();
            } else {
                setTimeout(() => checkEngineAvailability().then(resolve), 100);
            }
          });
        };

        // Load the script dynamically
        const script = document.createElement('script');
        script.src = '/godot.js';
        script.async = true;
        script.onload = () => {
          // Once script is loaded, check if Engine is available
          checkEngineAvailability().then(() => {
              setEngineLoaded(true);
          });
        };
        document.body.appendChild(script);

        // Clean up
        return () => {
          document.body.removeChild(script);
      };
    };

      loadEngineScript();
    }, []); // Empty dependency array ensures this runs only once

    useEffect(() => {
      if (engineLoaded && window.Engine) {
        console.log("window.Engine", window)
        // Now Engine is available, instantiate it
        const engineInstance = new window.Engine(GODOT_CONFIG); // Adjust GODOT_CONFIG as needed
        console.log(engineInstance);

        // Use engineInstance as needed
        engineInstance.startGame({
          canvas: canvasRef.current
        });
      }
    }, [engineLoaded]); // Only run this effect when engineLoaded changes

    return (
        <div>
          <h2>godot page</h2>
            <canvas ref={canvasRef} style={{border: "1px solid red"}}></canvas>
        </div>
    );
};

export default GodotGameTest;
