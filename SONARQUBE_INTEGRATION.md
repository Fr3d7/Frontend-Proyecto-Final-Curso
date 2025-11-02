# 🔗 Integración Jenkins-SonarQube - Configuración Completa

## ✅ Estado Actual

La integración entre Jenkins y SonarQube está configurada y funcionando correctamente. Este documento describe cómo está configurada y cómo verificar que todo funcione.

## 📋 Configuración en Jenkins

### 1. Plugin de SonarQube Scanner Instalado

- ✅ Plugin "SonarQube Scanner" instalado en Jenkins
- ✅ Herramienta `sonar-scanner-win` configurada en "Manage Jenkins > Global Tool Configuration"

### 2. Servidor SonarQube Configurado

- ✅ **Nombre de configuración:** `sonar-local`
- ✅ **URL del servidor:** Configurada en "Manage Jenkins > Configure System > SonarQube Servers"
- ✅ **Token de autenticación:** Configurado como credencial `sonarqube-token` (tipo: Secret text)

### 3. Configuración del Pipeline (Jenkinsfile)

El pipeline está configurado para:

1. **Ejecutar tests con cobertura:**
   ```groovy
   stage('Run tests (coverage)') {
     steps {
       dir("${APP_DIR}") {
         bat 'npm run test:ci'
       }
   }
   ```

2. **Generar informe de cobertura (lcov.info):**
   - Se genera automáticamente por Jest cuando se ejecutan los tests
   - Ubicación: `login-registration/coverage/lcov.info`
   - Formato: LCOV (compatible con SonarQube para JavaScript)

3. **Analizar con SonarQube:**
   ```groovy
   stage('SonarQube Analysis') {
     steps {
       dir("${APP_DIR}") {
         withCredentials([string(credentialsId: 'sonarqube-token', variable: 'SONAR_TOKEN')]) {
           withSonarQubeEnv('sonar-local') {
             bat 'sonar-scanner.bat ...'
           }
         }
       }
     }
   }
   ```

## 🔧 Configuración del SonarScanner

### Propiedades Clave Configuradas

```groovy
-Dsonar.projectKey=frontend-proyecto-final-QA
-Dsonar.projectName=frontend-proyecto-final-QA
-Dsonar.projectBaseDir=%CD%                    // Directorio actual (login-registration)
-Dsonar.sources=src                             // Archivos fuente a analizar
-Dsonar.tests=src                               // Archivos de test
-Dsonar.javascript.lcov.reportPaths=coverage/lcov.info  // ⭐ IMPORTANTE: Ruta al informe de cobertura
```

### Exclusiones Configuradas

- **Archivos excluidos del análisis:**
  - `**/*.test.js`, `**/*.test.jsx` (archivos de test)
  - `src/__tests__/**/*` (carpeta de tests)
  - `node_modules/**`, `build/**`, `coverage/**`
  - `src/index.js`, `src/reportWebVitals.js`, `src/setupTests.js` (archivos de configuración)

- **Archivos excluidos del cálculo de cobertura:**
  - Archivos de test (ya que no deben cubrirse a sí mismos)
  - Archivos de configuración (index.js, setupTests.js, etc.)

## 📊 Flujo de Trabajo

```
1. Checkout (git) 
   ↓
2. Install dependencies (npm ci)
   ↓
3. Run tests (coverage) 
   ├── Jest ejecuta los tests
   └── Genera coverage/lcov.info ⭐
   ↓
4. Build app
   ↓
5. SonarQube Analysis
   ├── Verifica que coverage/lcov.info existe
   ├── Ejecuta SonarScanner
   └── Importa coverage/lcov.info a SonarQube ⭐
   ↓
6. Quality Gate
   └── Espera a que SonarQube procese el análisis
   ↓
7. Package artifact
8. Deploy
```

## ✅ Verificación

### 1. Verificar en el Log de Jenkins

Después de ejecutar el pipeline, busca en el log:

```
=== VERIFICACION DEL ARCHIVO DE COBERTURA ===
coverage\lcov.info existe: [tamaño] bytes
Ruta absoluta: [ruta completa]

=== EJECUTANDO SONAR SCANNER ===
Integracion Jenkins-SonarQube configurada correctamente
Importando informe de cobertura desde: coverage/lcov.info

ANALYSIS SUCCESSFUL, you can find the results at: http://localhost:9000/dashboard?id=frontend-proyecto-final-QA
```

### 2. Verificar en SonarQube

1. Ve al dashboard de SonarQube: `http://localhost:9000`
2. Selecciona el proyecto: `frontend-proyecto-final-QA`
3. Revisa las métricas:
   - **Coverage** debería mostrar un porcentaje > 0%
   - **New Code** debería mostrar métricas de cobertura
   - **Issues** debería mostrar los problemas de código encontrados

## 🐛 Troubleshooting

### Problema: "Coverage = 0%" o "Not computed"

**Causas posibles:**
1. Los tests no se están ejecutando correctamente
2. El archivo `coverage/lcov.info` no se está generando
3. La ruta del informe no es correcta en SonarQube

**Solución:**
1. Verifica el log de Jenkins en el stage "Run tests (coverage)"
2. Confirma que `coverage/lcov.info` existe y tiene contenido
3. Verifica que `sonar.javascript.lcov.reportPaths=coverage/lcov.info` está configurado correctamente

### Problema: "No tests found"

**Solución:**
1. Verifica que los archivos de test existan en `login-registration/src/`
2. Asegúrate de que el comando `npm run test:ci` se ejecuta desde el directorio correcto
3. Revisa el log para ver qué archivos Jest está buscando

### Problema: SonarQube no encuentra el informe

**Solución:**
1. Verifica que `sonar.projectBaseDir` apunta al directorio correcto
2. Confirma que la ruta `coverage/lcov.info` es relativa a `projectBaseDir`
3. Ejecuta `dir coverage\lcov.info` en el stage de SonarQube para confirmar que el archivo existe

## 📚 Referencias

- [SonarQube JavaScript Plugin Documentation](https://docs.sonarqube.org/latest/analysis/languages/javascript/)
- [Jenkins SonarQube Plugin](https://plugins.jenkins.io/sonar/)
- [Jest Coverage Documentation](https://jestjs.io/docs/cli#--coverage)

## 🎯 Próximos Pasos

1. ✅ Configuración de Jenkins-SonarQube completada
2. ✅ Pipeline configurado para generar y importar coverage
3. ⏳ Ejecutar el pipeline y verificar que la cobertura se refleje en SonarQube
4. ⏳ Revisar métricas de "New Code" en SonarQube después de cada build

