# Finz — Control de Gastos

Web app para el registro rápido de gastos personales, pensada para usarse desde el móvil como si fuera una app: se instala en la pantalla de inicio del iPhone y permite anotar un gasto en segundos, sin depender de una app de banco o una hoja de Excel abierta a mano.

## Qué hace

Un formulario permite registrar cada gasto con tres datos: cantidad, concepto (por ejemplo, "Cena pizzería") y categoría (Ocio, Transporte, Salud...), elegida de una lista cerrada para mantener los datos consistentes. Cada gasto añadido se guarda automáticamente en el propio dispositivo y aparece al instante en un listado, con fecha e id asignados de forma automática.

En cualquier momento, el botón "Descargar CSV" exporta todos los gastos guardados a un archivo `.csv` listo para abrir directamente en Excel, con las columnas ya separadas y los símbolos y tildes correctamente codificados.

## Tecnologías

- HTML5
- CSS3
- JavaScript vanilla — sin frameworks ni librerías de terceros

## Qué habilidad demuestra

- Manipulación del DOM y gestión de eventos (`submit`, `click`) para construir una interfaz interactiva sin ningún framework.
- Validación de formularios con mensajes de error específicos por campo, incluyendo el manejo de la conversión de texto a número.
- Persistencia de datos en el cliente con `localStorage`, con generación de identificadores únicos consistentes incluso si en el futuro se añade la opción de borrar gastos.
- Generación de archivos descargables en el navegador con la API `Blob` y `URL.createObjectURL`, sin backend ni librerías externas.
- Atención a detalles reales de internacionalización: aceptación de coma o punto como separador decimal, uso de `;` como separador de columnas y BOM UTF-8 en el CSV para que se abra correctamente en Excel configurado en español.
- Configuración de meta etiquetas de iOS para que la web se comporte como una app instalable en pantalla de inicio, a pantalla completa.

## Cómo ejecutarlo

No requiere instalación ni backend. Basta con abrir `index.html` directamente en el navegador, o visitar la versión publicada:

```
https://AlvaroAlme.github.io/portfolio-alvaroalme/proyectos/control-de-gastos/
```

Para instalarla como app en un iPhone: abre esa URL en **Safari**, toca el icono de compartir y selecciona "Añadir a pantalla de inicio".
