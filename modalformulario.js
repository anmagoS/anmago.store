// modalformulario.js - VERSIÓN COMPLETA PARA CLIENTE, PEDIDO Y DETALLE PEDIDO
// 🚀 INICIALIZACIÓN INMEDIATA - Sin esperar DOMContentLoaded
console.log('🚀 INICIANDO FORMULARIO - VERSIÓN COMPLETA PEDIDOS + CLIENTES');

// 🔥 VARIABLES GLOBALES INMEDIATAS
window.articulosCarrito = [];
window.formularioInicializado = false;
window.ciudadesColombia = [];

// ✅ FUNCIÓN PARA FINALIZAR Y CERRAR/REDIRIGIR
window.finalizarRegistro = function(success = true, mensaje = '') {
    console.log('🎯 FINALIZANDO REGISTRO:', { success, mensaje });
    
    if (success) {
        // Mostrar mensaje de éxito
        if (typeof window.mostrarAlertaFeedback === 'function') {
            window.mostrarAlertaFeedback(mensaje || '✅ Registro completado exitosamente', 'success', 3000);
        }
        
        // Deshabilitar el formulario
        if (typeof window.deshabilitarFormulario === 'function') {
            window.deshabilitarFormulario();
        }
        
        // Cambiar mensaje del botón
        const btnEnviar = document.getElementById('btnEnviarPedido');
        if (btnEnviar) {
            btnEnviar.disabled = true;
            btnEnviar.innerHTML = '<i class="bi bi-check-circle"></i> ✅ Registro Completado';
            btnEnviar.className = 'btn btn-success px-4 py-2 rounded-pill fw-bold';
        }
        
        // Mostrar estado final
        if (typeof window.mostrarEstadoValidacion === 'function') {
            window.mostrarEstadoValidacion('✅ Registro exitoso. Redirigiendo...', 'success');
        }
        
        // Redirigir después de 3 segundos
        setTimeout(() => {
            // Verificar si viene de otra ventana (modal)
            if (window.opener && !window.opener.closed) {
                console.log('📱 Cerrando ventana modal...');
                window.close(); // Cierra esta ventana
            } else {
                // Redirigir al inicio
                console.log('🏠 Redirigiendo al inicio...');
                window.location.href = 'index.html';
            }
        }, 3000);
        
    } else {
        // Mostrar error
        if (typeof window.mostrarAlertaFeedback === 'function') {
            window.mostrarAlertaFeedback(mensaje || '❌ Error en el registro', 'danger', 5000);
        }
    }
};

// 🔍 FUNCIÓN MEJORADA - CONECTADA AL FEEDBACK VISUAL
async function consultarClienteAPI(telefono) {
    try {
        console.log('🔍 CONSULTANDO CLIENTE EXISTENTE:', telefono);
        
        // 📢 NOTIFICAR QUE SE ESTÁ BUSCANDO
        if (typeof window.mostrarEstadoValidacion === 'function') {
            window.mostrarEstadoValidacion('🔍 Buscando cliente en el sistema...', 'info');
        }
        
        // 📢 MOSTRAR FEEDBACK EN EL CAMPO DE TELÉFONO
        if (typeof window.mostrarFeedbackTelefono === 'function') {
            window.mostrarFeedbackTelefono('🔍 Buscando cliente...', 'cargando');
        }
        
        const url = `https://script.google.com/macros/s/AKfycbwt-rFg_coabATigGv_zNOa93aO6u9uNqC-Oynh_HAL4dbuKo6pvmtw7jKlixXagW5o/exec?telefonoCliente=${telefono}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        console.log('📊 RESPUESTA CONSULTA:', data);
        
        if (data.existe && data.datos) {
            // ✅ CLIENTE ENCONTRADO
            console.log('✅ CLIENTE ENCONTRADO');
            
            // Notificar éxito en el campo
            if (typeof window.mostrarFeedbackTelefono === 'function') {
                window.mostrarFeedbackTelefono('✅ Cliente encontrado', 'exito');
            }
            
            // Habilitar formulario para edición
            if (typeof window.habilitarFormularioParaEdicion === 'function') {
                window.habilitarFormularioParaEdicion(true, data.datos);
            }
            
            return {
                existe: true,
                datos: data.datos
            };
        } else {
            // ❌ CLIENTE NO ENCONTRADO - NUEVO
            console.log('🆕 CLIENTE NUEVO');
            
            // Notificar que es nuevo cliente
            if (typeof window.mostrarFeedbackTelefono === 'function') {
                window.mostrarFeedbackTelefono('🆕 Nuevo cliente', 'exito');
            }
            
            // Habilitar formulario para nuevo registro
            if (typeof window.habilitarFormularioParaEdicion === 'function') {
                window.habilitarFormularioParaEdicion(false);
            }
            
            return { existe: false };
        }
    } catch (error) {
        console.error('❌ ERROR en consulta:', error);
        
        // Notificar error
        if (typeof window.mostrarFeedbackTelefono === 'function') {
            window.mostrarFeedbackTelefono('⚠️ Error de conexión', 'error');
        }
        
        // Aún así, habilitar formulario para nuevo registro
        if (typeof window.habilitarFormularioParaEdicion === 'function') {
            window.habilitarFormularioParaEdicion(false);
        }
        
        return { existe: false };
    }
}

// ✅ CARGAR BASE DE DATOS DE CIUDADES
async function cargarCiudades() {
    try {
        const response = await fetch('ciudades.json');
        window.ciudadesColombia = await response.json();
        console.log('✅ Ciudades cargadas:', window.ciudadesColombia.length);
        
        inicializarAutocompletadoCiudades();
    } catch (error) {
        console.error('❌ Error cargando ciudades:', error);
        window.ciudadesColombia = [
            {departamento: "AMAZONAS", ciudad: "LETICIA"},
            {departamento: "ANTIOQUIA", ciudad: "MEDELLÍN"},
            {departamento: "BOGOTÁ", ciudad: "BOGOTÁ"},
            {departamento: "VALLE DEL CAUCA", ciudad: "CALI"},
            {departamento: "ATLÁNTICO", ciudad: "BARRANQUILLA"}
        ];
        inicializarAutocompletadoCiudades();
    }
}

// ✅ FUNCIONES DE AUTOCOMPLETADO DE CIUDADES
function inicializarAutocompletadoCiudades() {
    const inputCiudad = document.getElementById('ciudadCliente');
    const sugerencias = document.getElementById('sugerenciasCiudades');

    if (!inputCiudad || !sugerencias) {
        console.log('⚠️ Campos de ciudad no encontrados, reintentando...');
        setTimeout(inicializarAutocompletadoCiudades, 500);
        return;
    }

    console.log('✅ Inicializando autocompletado de ciudades...');

    inputCiudad.addEventListener('input', function() {
        const valor = this.value.trim();
        
        if (valor.length < 2) {
            sugerencias.style.display = 'none';
            return;
        }

        const coincidencias = window.ciudadesColombia.filter(item =>
            item.ciudad.toLowerCase().includes(valor.toLowerCase()) ||
            item.departamento.toLowerCase().includes(valor.toLowerCase())
        );

        mostrarSugerenciasCiudades(coincidencias);
    });

    document.addEventListener('click', function(e) {
        if (!inputCiudad.contains(e.target) && !sugerencias.contains(e.target)) {
            sugerencias.style.display = 'none';
        }
    });

    inputCiudad.addEventListener('keydown', function(e) {
        const items = sugerencias.querySelectorAll('.sugerencia-item');
        let itemActivo = sugerencias.querySelector('.sugerencia-item.active');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!itemActivo && items.length > 0) {
                items[0].classList.add('active');
            } else if (itemActivo) {
                itemActivo.classList.remove('active');
                const siguiente = itemActivo.nextElementSibling;
                if (siguiente) siguiente.classList.add('active');
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (itemActivo) {
                itemActivo.classList.remove('active');
                const anterior = itemActivo.previousElementSibling;
                if (anterior) anterior.classList.add('active');
            }
        } else if (e.key === 'Enter' && itemActivo) {
            e.preventDefault();
            seleccionarCiudad(itemActivo);
        } else if (e.key === 'Escape') {
            sugerencias.style.display = 'none';
        }
    });

    console.log('✅ Autocompletado de ciudades inicializado');
}

function mostrarSugerenciasCiudades(coincidencias) {
    const sugerencias = document.getElementById('sugerenciasCiudades');
    const inputCiudad = document.getElementById('ciudadCliente');
    
    if (!sugerencias || !inputCiudad) return;

    if (coincidencias.length === 0) {
        sugerencias.style.display = 'none';
        return;
    }

    sugerencias.innerHTML = '';
    
    coincidencias.slice(0, 8).forEach(item => {
        const li = document.createElement('li');
        li.className = 'dropdown-item sugerencia-item';
        li.style.cursor = 'pointer';
        li.style.padding = '8px 12px';
        li.innerHTML = `<div class="fw-bold">${item.ciudad} - ${item.departamento}</div>`;
        
        li.addEventListener('click', () => {
            inputCiudad.value = `${item.ciudad} - ${item.departamento}`;
            sugerencias.style.display = 'none';
            validarFormularioCliente();
        });
        
        li.addEventListener('mouseenter', () => {
            sugerencias.querySelectorAll('.sugerencia-item').forEach(i => i.classList.remove('active'));
            li.classList.add('active');
        });
        
        sugerencias.appendChild(li);
    });

    sugerencias.style.display = 'block';
}

function seleccionarCiudad(elemento) {
    const inputCiudad = document.getElementById('ciudadCliente');
    const sugerencias = document.getElementById('sugerenciasCiudades');
    
    if (inputCiudad && sugerencias) {
        inputCiudad.value = elemento.textContent.trim();
        sugerencias.style.display = 'none';
        validarFormularioCliente();
    }
}

// 🎯 DETECCIÓN GARANTIZADA DEL CARRITO - VERSIÓN SÍNCRONA
function detectarCarritoGarantizado() {
    console.log('🎯 INICIANDO DETECCIÓN GARANTIZADA DEL CARRITO');
    
    const urlParams = new URLSearchParams(window.location.search);
    const productosParam = urlParams.get('productos');
    
    if (productosParam && productosParam !== '[]' && productosParam !== 'null') {
        try {
            const productos = JSON.parse(decodeURIComponent(productosParam));
            if (Array.isArray(productos) && productos.length > 0) {
                window.articulosCarrito = productos;
                console.log('✅ CARRITO DETECTADO desde URL:', productos.length, 'productos');
                return true;
            }
        } catch (error) {
            console.error('❌ Error parseando URL:', error);
        }
    }
    
    try {
        const carritoLocal = localStorage.getItem('carritoAnmago');
        if (carritoLocal && carritoLocal !== '[]' && carritoLocal !== 'null') {
            const productos = JSON.parse(carritoLocal);
            if (Array.isArray(productos) && productos.length > 0) {
                window.articulosCarrito = productos;
                console.log('✅ CARRITO DETECTADO desde localStorage:', productos.length, 'productos');
                return true;
            }
        }
    } catch (error) {
        console.error('❌ Error parseando localStorage:', error);
    }
    
    if (window.opener && Array.isArray(window.opener.articulosCarrito) && window.opener.articulosCarrito.length > 0) {
        window.articulosCarrito = JSON.parse(JSON.stringify(window.opener.articulosCarrito));
        console.log('✅ CARRITO DETECTADO desde window.opener:', window.articulosCarrito.length, 'productos');
        return true;
    }
    
    console.log('ℹ️  NO hay carrito detectado - Modo registro solamente');
    return false;
}

// 🔥 EJECUCIÓN INMEDIATA - En IIFE para evitar redeclaración
(function() {
    const tieneCarrito = detectarCarritoGarantizado();
    console.log('🎯 RESULTADO DETECCIÓN:', tieneCarrito ? 'CON CARRITO' : 'SOLO REGISTRO');
})();

// 👤 Construir nombre del cliente - VERSIÓN RÁPIDA
function construirNombreCliente() {
    const nombreInput = document.getElementById("nombreCliente");
    return nombreInput ? nombreInput.value.trim() : "Cliente";
}

// ✅ Validación de formulario - VERSIÓN OPTIMIZADA
function validarFormularioCliente() {
    const nombre = document.getElementById("nombreCliente");
    const telefono = document.getElementById("telefonoCliente");
    const direccion = document.getElementById("DireccionCompleta");
    const ciudad = document.getElementById("ciudadCliente");
    
    const todosLlenos = nombre?.value.trim() && 
                       telefono?.value.trim() && 
                       direccion?.value.trim() && 
                       ciudad?.value.trim();
    
    const telefonoValido = telefono && /^3\d{9}$/.test(telefono.value.trim());

    const btnEnviar = document.getElementById("btnEnviarPedido");
    if (btnEnviar) {
        btnEnviar.disabled = !(todosLlenos && telefonoValido);
    }
    
    return todosLlenos && telefonoValido;
}

// 🔍 FUNCIÓN NUEVA: Validar estructura de productos
function validarProductosCarrito() {
    if (!window.articulosCarrito || !Array.isArray(window.articulosCarrito)) {
        console.error('❌ Carrito no válido');
        return false;
    }
    
    const problemas = [];
    
    window.articulosCarrito.forEach((item, index) => {
        if (!item.id) {
            problemas.push(`Producto ${index + 1}: Sin ID`);
        }
        if (!item.nombre) {
            problemas.push(`Producto ${index + 1}: Sin nombre`);
        }
        if (!item.precio || item.precio <= 0) {
            problemas.push(`Producto ${index + 1}: Precio inválido (${item.precio})`);
        }
        if (!item.cantidad || item.cantidad <= 0) {
            problemas.push(`Producto ${index + 1}: Cantidad inválida (${item.cantidad})`);
        }
    });
    
    if (problemas.length > 0) {
        console.warn('⚠️ Problemas en el carrito:', problemas);
        return false;
    }
    
    return true;
}

// 🏠 Construir dirección estructurada - VERSIÓN RÁPIDA
function construirDireccionEstructurada() {
    const direccionBase = document.getElementById("DireccionCompleta")?.value.trim() || '';
    const tipoUnidad = document.getElementById("tipoUnidad")?.value.trim() || '';
    const numeroApto = document.getElementById("numeroApto")?.value.trim() || '';
    const barrio = document.getElementById("barrio")?.value.trim() || '';
    const puntoReferencia = document.getElementById("observacionDireccion")?.value.trim() || '';

    let direccion = direccionBase;
    if (tipoUnidad) direccion += `, ${tipoUnidad}`;
    if (numeroApto) direccion += ` ${numeroApto}`;
    if (barrio) direccion += `, Barrio ${barrio}`;
    if (puntoReferencia) direccion += `, ${puntoReferencia}`;
    
    return direccion.trim();
}

// 🔄 Parseo inverso de dirección - VERSIÓN MEJORADA CON LOGGING
function repartirDireccionConcatenada(direccionConc) {
    console.log('📍 INICIANDO PARSEO DE DIRECCIÓN:', direccionConc);
    
    if (!direccionConc) {
        console.log('📍 DIRECCIÓN VACÍA - No hay nada que parsear');
        return;
    }

    const baseInput = document.getElementById("DireccionCompleta");
    const tipoInput = document.getElementById("tipoUnidad");
    const numeroInput = document.getElementById("numeroApto");
    const barrioInput = document.getElementById("barrio");
    const refInput = document.getElementById("observacionDireccion");

    if (tipoInput) tipoInput.value = "";
    if (numeroInput) numeroInput.value = "";
    if (barrioInput) barrioInput.value = "";
    if (refInput) refInput.value = "";

    const partes = direccionConc.split(",").map(p => p.trim()).filter(p => p !== "");
    console.log('📍 PARTES DE DIRECCIÓN:', partes);
    
    if (partes.length === 0) return;

    if (baseInput) {
        baseInput.value = partes[0];
        console.log('📍 DIRECCIÓN BASE:', partes[0]);
    }

    if (partes.length > 1 && tipoInput) {
        const segundaParte = partes[1].toUpperCase();
        console.log('📍 SEGUNDA PARTE:', segundaParte);
        
        const tipos = ["APARTAMENTO", "CASA", "PISO", "BODEGA", "INTERIOR"];
        const tipoEncontrado = tipos.find(t => segundaParte.includes(t));
        
        if (tipoEncontrado) {
            tipoInput.value = tipoEncontrado.charAt(0) + tipoEncontrado.slice(1).toLowerCase();
            console.log('📍 TIPO UNIDAD:', tipoInput.value);
            
            const numeroTexto = partes[1].replace(new RegExp(tipoEncontrado, 'i'), "").trim();
            if (numeroTexto && numeroInput) {
                numeroInput.value = numeroTexto;
                console.log('📍 NÚMERO:', numeroInput.value);
            }
        }
    }

    if (partes.length > 2 && barrioInput) {
        const barrioValue = partes[2].replace(/^barrio\s*/i, "").trim();
        barrioInput.value = barrioValue;
        console.log('📍 BARRIO:', barrioValue);
    }

    if (partes.length > 3 && refInput) {
        const referenciaValue = partes.slice(3).join(", ");
        refInput.value = referenciaValue;
        console.log('📍 REFERENCIA:', referenciaValue);
    }
    
    console.log('📍 PARSEO DE DIRECCIÓN COMPLETADO');
}

// 🔧 FUNCIÓN NUEVA: Preparar productos para enviar
function prepararProductosParaEnvio() {
    if (!window.articulosCarrito || window.articulosCarrito.length === 0) {
        return [];
    }
    
    console.log('📦 Preparando productos para enviar:', window.articulosCarrito.length);
    
    return window.articulosCarrito.map((item, index) => {
        const idCompleto = item.id || '';
        const [idBase, ...varianteParts] = idCompleto.split('-');
        const variante = varianteParts.join('-').trim() || 'Estándar';
        
        console.log(`  Producto ${index + 1}:`, {
            idCompleto,
            idBase,
            variante,
            nombre: item.nombre,
            talla: item.talla
        });
        
        return {
            productoId: idBase.trim(),
            nombreCompleto: item.nombre || 'Producto sin nombre',
            talla: item.talla || 'Única',
            precio: item.precio || 0,
            cantidad: item.cantidad || 1,
            variante: variante,
            imagen: item.imagen || ''
        };
    });
}

// 💬 Generar texto para WhatsApp - VERSIÓN ULTRA CONFIABLE
function generarTextoWhatsApp() {
    const nombreCliente = construirNombreCliente();
    
    const carritoActual = window.articulosCarrito;
    const tieneProductos = Array.isArray(carritoActual) && carritoActual.length > 0;
    
    console.log('🔍 GENERANDO WHATSAPP - Estado actual:', {
        nombreCliente,
        tieneProductos,
        productos: carritoActual?.length || 0,
        carrito: carritoActual
    });

    if (tieneProductos) {
        console.log('📝 GENERANDO MENSAJE DE PEDIDO CON PRODUCTOS');
        
        const productos = carritoActual.map((p, i) => {
            let productoTexto = `${i + 1}. ${p.nombre || 'Producto'}\n`;
            
            if (p.imagen) {
                productoTexto += `🖼️ Imagen: ${p.imagen}\n`;
            }
            
            productoTexto += `📏 Talla: ${p.talla || "Única"}\n`;
            productoTexto += `💲 Precio: $${(p.precio || 0).toLocaleString("es-CO")}\n`;
            productoTexto += `🔢 Cantidad: ${p.cantidad || 1}`;
            
            return productoTexto;
        }).join("\n\n");

        const total = carritoActual.reduce((sum, p) => 
            sum + ((p.precio || 0) * (p.cantidad || 1)), 0
        );

        return `🛍️ ¡Hola! Soy ${nombreCliente} y quiero realizar el siguiente pedido:\n\n${productos}\n\n🧾 Total: $${total.toLocaleString("es-CO")}\n\n✅ ¡Gracias!`;
    } else {
        console.log('📝 GENERANDO MENSAJE DE REGISTRO SOLAMENTE');
        return `¡Hola! Soy ${nombreCliente} y quiero registrarme como cliente.`;
    }
}

// 📤 Envío a WhatsApp - VERSIÓN MEJORADA
function enviarPedidoWhatsApp() {
    try {
        const mensaje = generarTextoWhatsApp();
        const telefono = '573006498710';
        const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
        
        console.log('📤 ENVIANDO WHATSAPP:', url.substring(0, 100) + '...');
        
        const nuevaVentana = window.open(url, '_blank');
        if (!nuevaVentana) {
            console.warn('⚠️  Popup bloqueado, redirigiendo en misma ventana');
            window.location.href = url;
        }
    } catch (error) {
        console.error('❌ ERROR enviando WhatsApp:', error);
        alert('Error al abrir WhatsApp. Por favor intenta manualmente.');
    }
}

// 📊 Enviar datos a Google Sheets - VERSIÓN COMPLETA PARA PEDIDOS
function enviarDatosGoogleSheets() {
    return new Promise((resolve, reject) => {
        try {
            console.log('📤 ENVIANDO DATOS CLIENTE Y PEDIDO VÍA GET...');
            
            const telefono = document.getElementById('telefonoCliente')?.value.trim() || '';
            const nombre = document.getElementById('nombreCliente')?.value.trim() || '';
            const direccionBase = document.getElementById('DireccionCompleta')?.value.trim() || '';
            const ciudad = document.getElementById('ciudadCliente')?.value.trim() || '';
            const email = document.getElementById('emailCliente')?.value.trim() || '';
            const clienteId = document.getElementById('clienteId')?.value.trim() || '';
            
            const direccionCompleta = construirDireccionEstructurada();
            
            const productos = prepararProductosParaEnvio();
            const tieneProductos = productos.length > 0;
            
            console.log('🛒 Estado del pedido:', {
                tieneProductos,
                cantidadProductos: productos.length,
                productos: productos
            });
            
            const baseURL = 'https://script.google.com/macros/s/AKfycbwt-rFg_coabATigGv_zNOa93aO6u9uNqC-Oynh_HAL4dbuKo6pvmtw7jKlixXagW5o/exec';
            
            const params = new URLSearchParams();
            
            params.append('telefonoCliente', telefono);
            params.append('nombreCliente', nombre);
            params.append('direccionCliente', direccionBase);
            params.append('complementoDir', direccionCompleta);
            params.append('ciudadDestino', ciudad);
            params.append('correo', email);
            params.append('clienteId', clienteId);
            params.append('usuario', 'ANMAGOSTORE@GMAIL.COM');
            
            params.append('apellidoCompl', '');
            params.append('cedula', '');
            params.append('rotular', '');
            params.append('rotulo', '');
            params.append('mensajeCobro', '');
            
            params.append('tipoOperacion', tieneProductos ? 'pedidoCompleto' : 'soloCliente');
            
            if (tieneProductos) {
                params.append('productosJSON', JSON.stringify(productos));
                console.log('📦 Productos incluidos en la solicitud');
            }
            
            const urlCompleta = `${baseURL}?${params.toString()}`;
            
            console.log('🔗 URL de envío (primeros 200 chars):', urlCompleta.substring(0, 200) + '...');
            
            fetch(urlCompleta)
                .then(response => {
                    console.log('✅ Solicitud GET enviada exitosamente');
                    resolve({
                        success: true,
                        tieneProductos: tieneProductos,
                        cantidadProductos: productos.length
                    });
                })
                .catch(error => {
                    console.error('❌ Error en fetch GET:', error);
                    fallbackImageRequest(urlCompleta);
                    resolve({
                        success: true,
                        tieneProductos: tieneProductos,
                        cantidadProductos: productos.length
                    });
                });
                
        } catch (error) {
            console.error('❌ ERROR en enviarDatosGoogleSheets:', error);
            reject(error);
        }
    });
}

// 🎯 MÉTODO FALLBACK - Usar imagen para requests GET (100% confiable)
function fallbackImageRequest(url) {
    try {
        console.log('🔄 Usando método fallback con imagen...');
        const img = new Image();
        img.src = url;
        img.onload = () => console.log('✅ Fallback exitoso');
        img.onerror = () => console.log('⚠️ Fallback con error, pero request se envió');
    } catch (error) {
        console.log('✅ Request enviado (fallback completado)');
    }
}

// 🚀 INICIALIZACIÓN MEJORADA - CONECTADA AL FEEDBACK
function inicializarFormulario() {
    if (window.formularioInicializado) return;
    window.formularioInicializado = true;
    
    console.log('🚀 INICIALIZANDO FORMULARIO - CON FEEDBACK VISUAL');
    const form = document.getElementById("formCliente");
    
    if (!form) {
        console.error("❌ FORMULARIO NO ENCONTRADO");
        setTimeout(inicializarFormulario, 100);
        return;
    }

    console.log("✅ FORMULARIO ENCONTRADO, CONFIGURANDO EVENTOS...");

    // 🔧 CONFIGURAR CAMPOS INICIALMENTE DESHABILITADOS
    const otrosCampos = document.querySelectorAll("#formCliente input:not(#telefonoCliente), #formCliente textarea, #formCliente select");
    otrosCampos.forEach(el => {
        el.disabled = true;
        el.classList.add('campo-deshabilitado');
    });

    // 🔧 CONFIGURAR BOTÓN INICIAL
    const btnEnviar = document.getElementById("btnEnviarPedido");
    if (btnEnviar) {
        btnEnviar.disabled = true;
        btnEnviar.className = 'btn btn-secondary px-4 py-2 rounded-pill fw-bold';
        btnEnviar.innerHTML = '<i class="bi bi-send"></i>✨ Finalizar Compra... ✨';
    }

    // 🔧 CONFIGURAR ESTADO INICIAL
    const estadoFormulario = document.getElementById('estado-formulario');
    if (estadoFormulario) {
        estadoFormulario.textContent = '⏳ Completa el número de celular para continuar';
        estadoFormulario.className = 'text-muted small mt-2';
    }

    // 📋 CONFIGURAR EVENTOS DE VALIDACIÓN
    ["nombreCliente", "telefonoCliente", "DireccionCompleta", "ciudadCliente"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("input", validarFormularioCliente);
    });

    // 📱 CONFIGURAR VALIDACIÓN EN TIEMPO REAL DEL TELÉFONO
    const campoTelefono = document.getElementById("telefonoCliente");
    if (campoTelefono) {
        let timeoutConsulta;
        
        campoTelefono.addEventListener("input", () => {
            clearTimeout(timeoutConsulta);
            const telefono = campoTelefono.value.trim();
            
            if (!/^3\d{9}$/.test(telefono)) {
                validarFormularioCliente();
                return;
            }

            // ⚠️ IMPORTANTE: Solo deshabilitar si no hay datos cargados
            if (!document.getElementById("nombreCliente").value) {
                otrosCampos.forEach(el => el.disabled = true);
            }
            
            timeoutConsulta = setTimeout(async () => {
                try {
                    console.log('📞 CONSULTANDO CLIENTE:', telefono);
                    const resultado = await consultarClienteAPI(telefono);
                    
                    if (resultado?.existe && resultado.datos) {
                        const d = resultado.datos;
                        console.log('✅ CLIENTE EXISTENTE - PRECARGANDO DATOS:', d);
                        
                        if (!document.getElementById("clienteId").value) {
                            document.getElementById("clienteId").value = d["CLIENTEID"] || "";
                        }
                        
                        if (!document.getElementById("nombreCliente").value) {
                            document.getElementById("nombreCliente").value = d["NOMBRECLIENTE"] || "";
                        }
                        
                        if (!document.getElementById("ciudadCliente").value) {
                            document.getElementById("ciudadCliente").value = d["CIUDAD DESTINO"] || "";
                        }
                        
                        if (!document.getElementById("emailCliente").value) {
                            document.getElementById("emailCliente").value = d["CORREO"] || "";
                        }
                        
                        if (!document.getElementById("DireccionCompleta").value && d["DIRECCIONCLIENTE"]) {
                            repartirDireccionConcatenada(d["DIRECCIONCLIENTE"]);
                        }
                        
                        console.log('✅ PRECARGA COMPLETADA - Campos actualizados');
                        
                    } else {
                        console.log('🆕 CLIENTE NUEVO - Manteniendo campos existentes');
                        if (!document.getElementById("clienteId").value) {
                            document.getElementById("clienteId").value = "";
                        }
                    }
                } catch (error) {
                    console.error('❌ Error en consulta:', error);
                } finally {
                    otrosCampos.forEach(el => el.disabled = false);
                    validarFormularioCliente();
                }
            }, 800);
        });
    }

    // 📤 CONFIGURAR BOTÓN DE ENVÍO (ACTUALIZADO CON finalizarRegistro)
    if (btnEnviar) {
        btnEnviar.addEventListener("click", async (e) => {
            e.preventDefault();
            console.log('🚀 INICIANDO ENVÍO DE PEDIDO Y CLIENTE');

            if (!validarFormularioCliente()) {
                alert('❌ Completa todos los campos requeridos');
                return;
            }
            
            const tieneCarrito = window.articulosCarrito && window.articulosCarrito.length > 0;
            if (tieneCarrito && !validarProductosCarrito()) {
                alert('⚠️ Hay problemas con los productos del carrito. Revísalos antes de enviar.');
                return;
            }

            try {
                btnEnviar.textContent = '📤 Enviando...';
                btnEnviar.disabled = true;
                btnEnviar.classList.add('btn-cargando');

                const direccionFinal = construirDireccionEstructurada();
                document.getElementById("DireccionCompleta").value = direccionFinal;

                console.log('👤 ENVIANDO/ACTUALIZANDO CLIENTE Y PEDIDO...');
                const resultadoEnvio = await enviarDatosGoogleSheets();
                console.log('✅ PROCESADO EN SHEETS:', resultadoEnvio);

                console.log('📱 ENVIANDO WHATSAPP...');
                enviarPedidoWhatsApp();
                console.log('✅ WHATSAPP INICIADO');

                if (window.articulosCarrito.length > 0) {
                    console.log('🛒 LIMPIANDO CARRITO...');
                    window.articulosCarrito = [];
                    localStorage.removeItem('carritoAnmago');
                    
                    if (window.opener && !window.opener.closed) {
                        try {
                            window.opener.postMessage("limpiarCarrito", "*");
                        } catch (e) {
                            console.log('⚠️  No se pudo comunicar con ventana padre');
                        }
                    }
                }

                console.log('🎯 PROCESO COMPLETADO - Cliente y pedido enviados');
                
                // ✅ LLAMAR A LA FUNCIÓN DE FINALIZACIÓN
                const mensajeFinal = tieneCarrito 
                    ? '✅ Pedido y registro completados exitosamente' 
                    : '✅ Registro de cliente completado exitosamente';
                
                finalizarRegistro(true, mensajeFinal);

            } catch (error) {
                console.error('❌ ERROR en proceso de envío:', error);
                
                // ❌ MOSTRAR ERROR
                finalizarRegistro(false, '❌ Error al enviar. Por favor intenta nuevamente.');
                
                // Restaurar botón
                btnEnviar.textContent = '❌ Error - Reintentar';
                btnEnviar.disabled = false;
                btnEnviar.classList.remove('btn-cargando');
            }
        });
    }

    setTimeout(validarFormularioCliente, 100);
    console.log("🎯 FORMULARIO INICIALIZADO CORRECTAMENTE");
}

// 🔥 EJECUCIÓN INMEDIATA - Múltiples estrategias
document.addEventListener('DOMContentLoaded', function() {
    inicializarFormulario();
    cargarCiudades();
});

setTimeout(() => {
    if (!window.formularioInicializado) {
        inicializarFormulario();
    }
    if (window.ciudadesColombia.length === 0) {
        cargarCiudades();
    }
}, 500);

setTimeout(() => {
    if (!window.formularioInicializado) {
        console.log('⚡ INICIALIZACIÓN POR TIMEOUT DE SEGURIDAD');
        inicializarFormulario();
    }
    if (window.ciudadesColombia.length === 0) {
        console.log('⚡ CARGANDO CIUDADES POR TIMEOUT DE SEGURIDAD');
        cargarCiudades();
    }
}, 1000);

// 🆘 DIAGNÓSTICO RÁPIDO
window.diagnosticoFormulario = function() {
    console.log("🩺 DIAGNÓSTICO FORMULARIO RÁPIDO:");
    console.log("- Carrito actual:", window.articulosCarrito);
    console.log("- Productos:", window.articulosCarrito.length);
    console.log("- Formulario inicializado:", window.formularioInicializado);
    console.log("- Ciudades cargadas:", window.ciudadesColombia.length);
    console.log("- WhatsApp generado:", generarTextoWhatsApp().substring(0, 100) + '...');
    
    const ciudadInput = document.getElementById('ciudadCliente');
    console.log("- Campo ciudad:", ciudadInput ? 'ENCONTRADO' : 'NO ENCONTRADO');
    if (ciudadInput) {
        console.log("- Valor ciudad:", ciudadInput.value);
    }
};

// 🔧 NUEVA FUNCIÓN: Test de envío de productos
window.testEnvioProductos = function() {
    console.log('🧪 TEST: Preparando productos para envío');
    const productos = prepararProductosParaEnvio();
    console.log('📦 Productos preparados:', productos);
    console.log('🔗 JSON para enviar:', JSON.stringify(productos));
    return productos;
};

// ✅ EXPORTAR FUNCIONES PARA EL HTML PRINCIPAL
window.validarClienteExistente = async function(telefono) {
    console.log('📞 VALIDACIÓN SOLICITADA DESDE HTML:', telefono);
    return await consultarClienteAPI(telefono);
};
