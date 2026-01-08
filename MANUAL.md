# MANUAL DE NEO-OS v3.1

## Descripción General
Neo-OS es una interfaz de terminal Cyberpunk hiper-inmersiva. Cuenta con 3 facciones únicas, cada una con su propio tema visual, paisaje sonoro y objetivos de misión.

## Facciones y Misiones

### 1. NETRUNNER (El Fantasma)
**Estilo**: Cian, Holográfico, Zen.
**Objetivo**: Infiltrarse en la Subred de Arasaka.
**Pasos de la Misión**:
1.  `scan`: Localizar nodos de red vulnerables.
2.  `breach`: Eludir la seguridad ICE (Activa Minijuego).
3.  `upload`: Exfiltrar carga de datos (Activa Velocidad Warp).

### 2. ARASAKA (La Corporación)
**Estilo**: Rojo, Táctico, Militarista.
**Objetivo**: Eliminar Hostiles en el Sector 4.
**Pasos de la Misión**:
1.  `tactical scan`: Identificar posiciones enemigas.
2.  `deploy`: Lanzar Dron de Vigilancia (Activa Escaneo de Dron).
3.  `purge`: Eliminar objetivos y borrar registros.

### 3. NOMAD (El Nómada)
**Estilo**: Ámbar, Retro-Analógico, Mecánico.
**Objetivo**: Contrabandear mercancía a través de la frontera.
**Pasos de la Misión**:
1.  `boot`: Iniciar diagnósticos del motor.
2.  `radio`: Sintonizar frecuencia segura (Activa Visuales de Audio).
3.  `ping`: Verificar conexión de la red de contrabandistas.

## Características del Sistema

### Minijuego de Hackeo (Protocolo de Invasión)
Al ejecutar un comando `breach`, se activan los protocolos de seguridad:
- **Meta**: Seleccionar códigos hex para coincidir con la Secuencia Objetivo.
- **Reglas**: Debes alternar entre seleccionar de la Fila activa y la Columna activa.
- **Temporizador**: 30 Segundos.
- **Fallo**: Activa Alarma del Sistema.

### Sistema de Alarma
La seguridad es estricta en Night City. Una alarma (Destello Rojo + Sirena) se activará si:
- Ejecutas comandos de misión fuera de orden (ej., intentar `upload` antes de `breach`).
- Fallas el Minijuego de Hackeo.

### Motor de Audio
- **Ambiental**: Cada facción tiene un bucle de fondo único (Trance, Industrial, Synthwave).
- **SFX**: Sonidos de escritura de alta fidelidad, acceso concedido/denegado, y sonidos de interacción de UI.
- **Silenciar**: Cambia el audio a través del icono de altavoz en la barra superior.

### Soporte de Idiomas
Neo-OS soporta **English**, **Español** y **Português**. Cambia a través de la barra superior. Todas las pistas de misión y textos se ajustan en tiempo real.
