# Copy Values ✨

[![Licença: MIT](https://img.shields.io/badge/Licença-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Uma ferramenta de linha de comando que lê variáveis de ambiente de um arquivo `values.yaml` e as copia para sua área de transferência em múltiplos formatos, eliminando a tediosa tarefa de configurar ambientes de desenvolvimento local.

## O Problema

Se você trabalha com Kubernetes, provavelmente define suas configurações em arquivos `values.yaml`. Ao trazer o projeto para sua máquina local, você se vê repetidamente copiando e colando esses valores em arquivos `.env` ou nas configurações de inicialização da sua IDE (como os `VM Args` para projetos Java). Esse processo manual é lento, propenso a erros e um obstáculo para um fluxo de trabalho ágil.

## A Solução

`copy-values` automatiza completamente esse processo. Com um único comando, ele encontra inteligentemente a raiz do seu projeto, lê o arquivo `values.yaml`, formata as variáveis de ambiente e as copia para sua área de transferência, prontas para serem usadas.

---

## Funcionalidades Principais

-   **Detecção Automática de Projeto**: Encontra a raiz do seu projeto (procurando por `.git`) e funciona de qualquer subdiretório.
-   **Múltiplos Formatos de Saída**: Suporta argumentos de VM Java (`-Dkey="value"`) e formato `.env` (`KEY=value`).
-   **Citação Inteligente de URLs**: Envolve automaticamente os valores de URL em aspas simples (`'`) para evitar erros de interpretação de caracteres especiais.
-   **Criação de Arquivos**: Opcionalmente, salva a saída diretamente em arquivos (`./vmoptions/app.vmoptions` ou `./env/.env`) usando a flag `-c`.
-   **Integração com VS Code**: Inclui um comando dedicado para colar os argumentos de VM da sua área de transferência diretamente no seu arquivo `.vscode/launch.json`.

## Pré-requisitos

-   [Node.js](https://nodejs.org/) (versão 16 ou superior)
-   npm (geralmente instalado com o Node.js)

## Instalação

Para ter acesso ao comando `copyvalues` de qualquer lugar no seu sistema, instale-o globalmente.

1.  Clone este repositório para sua máquina local.
2.  Navegue até o diretório do projeto clonado e execute:

```bash
npm install -g .
```
Isso compilará o código TypeScript e criará um link simbólico global para a ferramenta.

## Como Usar

### 1. Estrutura Esperada

A ferramenta foi projetada para funcionar com uma estrutura de projeto comum, onde o arquivo `values.yaml` está localizado em:
`[RAIZ_DO_PROJETO]/src/main/kubernetes/values.yaml`

O arquivo `values.yaml` deve ter uma chave `env` que contém uma lista de variáveis:

**Exemplo de `values.yaml`:**
```yaml
# ... outras configurações do Helm
env:
  - name: DATABASE_URL
    value: "postgres://user:pass@host:5432/db"
  - name: SERVICE_API_URL
    value: "https://api.exemplo.com/v1"
  - name: ENABLE_FEATURE_FLAG
    value: "true"
  - name: RUN_VARIABLES
    value: "-Xmx512m -Xms256m"
# ...
```

### 2. Comandos Disponíveis

#### **Copiar como Argumentos de VM (Padrão)**
Formata as variáveis como argumentos de VM Java. Este é o comportamento padrão se nenhuma flag de formato for usada.

```bash
copyvalues
# ou
copyvalues -vm
```
**Saída (na área de transferência):**
```
-DDATABASE_URL="'postgres://user:pass@host:5432/db'"
-DSERVICE_API_URL="'https://api.exemplo.com/v1'"
-DENABLE_FEATURE_FLAG="true"
-Xmx512m
-Xms256m
```

---
#### **Copiar no Formato `.env`**
Formata as variáveis como `CHAVE=VALOR`, ideal para a maioria dos projetos Node.js, Python, etc.

```bash
copyvalues -env
```
**Saída (na área de transferência):**
```
DATABASE_URL='postgres://user:pass@host:5432/db'
SERVICE_API_URL='https://api.exemplo.com/v1'
ENABLE_FEATURE_FLAG=true
RUN_VARIABLES=-Xmx512m -Xms256m
```

---
#### **Criar Arquivos de Configuração**
Use a flag `-c` junto com uma flag de formato para criar um arquivo local além de copiar para a área de transferência.

```bash
# Cria o arquivo ./vmoptions/app.vmoptions
copyvalues -vm -c

# Cria o arquivo ./env/.env
copyvalues -env -c
```

---
#### **Atualizar `launch.json` do VS Code**
Este é um comando auxiliar que pega o conteúdo **da sua área de transferência** e o cola na propriedade `vmArgs` da primeira configuração no seu arquivo `.vscode/launch.json`.

É um fluxo de trabalho de dois passos:
```bash
# Passo 1: Copie os argumentos de VM para a área de transferência
copyvalues -vm

# Passo 2: Use o comando especial para atualizar o launch.json
copyvalues --update-launch-json
```

---
#### **Obter Ajuda**
Para ver a lista completa de comandos e opções a qualquer momento:
```bash
copyvalues -h
```

## Contribuições
Contribuições são muito bem-vindas! Se você encontrar um bug ou tiver uma ideia para uma nova funcionalidade, sinta-se à vontade para [abrir uma issue](https://github.com/Krisner94/copy-values/issues).

Para contribuir com código:
1.  Faça um **Fork** deste repositório.
2.  Crie uma nova **Branch** (`git checkout -b feature/minha-feature`).
3.  Faça o **Commit** das suas alterações (`git commit -m 'Adiciona minha feature incrível'`).
4.  Faça o **Push** para a sua Branch (`git push origin feature/minha-feature`).
5.  Abra um **Pull Request**.

## Licença
Este projeto está distribuído sob a Licença MIT. Veja o arquivo `LICENSE` para mais detalhes.