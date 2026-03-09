#!/bin/bash

echo "🚀 Iniciando testes de autenticação do Drivoo"
echo "=============================================="

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado. Por favor, instale o Node.js primeiro."
    exit 1
fi

# Verificar se o npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não está instalado. Por favor, instale o npm primeiro."
    exit 1
fi

echo "✅ Node.js e npm estão instalados"

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Falha ao instalar dependências"
        exit 1
    fi
    echo "✅ Dependências instaladas"
else
    echo "✅ Dependências já instaladas"
fi

echo ""
echo "🧪 Executando testes de autenticação..."
echo ""

# Executar testes de registro de aluno
echo "📋 Testes de Registro de Aluno:"
npm test -- --testPathPattern="registerAluno" --no-coverage
if [ $? -ne 0 ]; then
    echo "❌ Testes de registro de aluno falharam"
    exit 1
fi
echo "✅ Testes de registro de aluno passaram"

echo ""

# Executar testes de registro de instrutor
echo "📋 Testes de Registro de Instrutor:"
npm test -- --testPathPattern="registerInstrutor" --no-coverage
if [ $? -ne 0 ]; then
    echo "❌ Testes de registro de instrutor falharam"
    exit 1
fi
echo "✅ Testes de registro de instrutor passaram"

echo ""

# Executar testes de login
echo "📋 Testes de Login:"
npm test -- --testPathPattern="login" --no-coverage
if [ $? -ne 0 ]; then
    echo "❌ Testes de login falharam"
    exit 1
fi
echo "✅ Testes de login passaram"

echo ""

# Executar testes de integração
echo "📋 Testes de Integração:"
npm test -- --testPathPattern="integration" --no-coverage
if [ $? -ne 0 ]; then
    echo "❌ Testes de integração falharam"
    exit 1
fi
echo "✅ Testes de integração passaram"

echo ""
echo "=============================================="
echo "🎉 Todos os testes de autenticação passaram!"
echo ""
echo "📊 Resumo:"
echo "  ✅ Registro de Aluno"
echo "  ✅ Registro de Instrutor"
echo "  ✅ Login"
echo "  ✅ Integração"
echo ""
echo "🚀 Sistema de autenticação pronto para uso!"