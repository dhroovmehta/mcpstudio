import { describe, it, expect } from 'vitest'
import {
  preparePythonDeploymentFiles,
  prepareTSDeploymentFiles,
} from '@/lib/vercel-api'

describe('preparePythonDeploymentFiles', () => {
  const code = '# test code'
  const requirements = 'mcp>=1.0.0\nhttpx>=0.25.0'

  it('returns three files', () => {
    const files = preparePythonDeploymentFiles(code, requirements, 'test-server')
    expect(files).toHaveLength(3)
  })

  it('includes api/index.py', () => {
    const files = preparePythonDeploymentFiles(code, requirements, 'test-server')
    const pyFile = files.find((f) => f.file === 'api/index.py')
    expect(pyFile).toBeDefined()
    expect(pyFile!.data).toBe(code)
  })

  it('includes requirements.txt', () => {
    const files = preparePythonDeploymentFiles(code, requirements, 'test-server')
    const reqFile = files.find((f) => f.file === 'requirements.txt')
    expect(reqFile).toBeDefined()
    expect(reqFile!.data).toContain('mcp')
  })

  it('includes vercel.json with Python runtime', () => {
    const files = preparePythonDeploymentFiles(code, requirements, 'test-server')
    const vercelFile = files.find((f) => f.file === 'vercel.json')
    expect(vercelFile).toBeDefined()
    const config = JSON.parse(vercelFile!.data)
    expect(config.builds[0].use).toBe('@vercel/python')
    expect(config.routes).toHaveLength(1)
  })
})

describe('prepareTSDeploymentFiles', () => {
  const code = '// test code'
  const packageJson = '{"name":"test"}'

  it('returns four files', () => {
    const files = prepareTSDeploymentFiles(code, packageJson, 'test-server')
    expect(files).toHaveLength(4)
  })

  it('includes api/index.ts', () => {
    const files = prepareTSDeploymentFiles(code, packageJson, 'test-server')
    const tsFile = files.find((f) => f.file === 'api/index.ts')
    expect(tsFile).toBeDefined()
    expect(tsFile!.data).toBe(code)
  })

  it('includes package.json', () => {
    const files = prepareTSDeploymentFiles(code, packageJson, 'test-server')
    const pkgFile = files.find((f) => f.file === 'package.json')
    expect(pkgFile).toBeDefined()
  })

  it('includes vercel.json with Node runtime', () => {
    const files = prepareTSDeploymentFiles(code, packageJson, 'test-server')
    const vercelFile = files.find((f) => f.file === 'vercel.json')
    expect(vercelFile).toBeDefined()
    const config = JSON.parse(vercelFile!.data)
    expect(config.builds[0].use).toBe('@vercel/node')
  })

  it('includes tsconfig.json', () => {
    const files = prepareTSDeploymentFiles(code, packageJson, 'test-server')
    const tsConfigFile = files.find((f) => f.file === 'tsconfig.json')
    expect(tsConfigFile).toBeDefined()
    const tsConfig = JSON.parse(tsConfigFile!.data)
    expect(tsConfig.compilerOptions.target).toBe('ES2022')
  })
})
