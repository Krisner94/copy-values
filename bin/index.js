#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const clipboardy = require('clipboardy').default;

// Configurações
const DEFAULT_SEARCH_DEPTH = 5;
const OUTPUT_FILES = {
    env: 'app.env',
    vm: '.vm-options',
    args: 'env-args.json'
};

// Função para buscar arquivos recursivamente com profundidade limitada
function findYamlFiles(startPath, maxDepth = DEFAULT_SEARCH_DEPTH, currentDepth = 0) {
    if (currentDepth > maxDepth) return [];

    let results = [];
    try {
        const files = fs.readdirSync(startPath);

        for (const file of files) {
            const fullPath = path.join(startPath, file);
            const stat = fs.lstatSync(fullPath);

            if (stat.isDirectory()) {
                // Ignora node_modules e diretórios ocultos
                if (!file.includes('node_modules') && !file.startsWith('.')) {
                    results = results.concat(
                        findYamlFiles(fullPath, maxDepth, currentDepth + 1)
                    );
                }
            } else if (file === 'values.yaml') {
                results.push(fullPath);
            }
        }
    } catch (err) {
        // Ignora diretórios sem permissão
    }

    return results;
}

// Formatadores
const formatters = {
    env: function (envs) {
        return envs.map(e => `${e.name}=${e.value || ''}`).join('\n');
    },

    vm: envs => {
        return envs.map(e => {
            const value = e.value || '';
            let formattedValue = value;

            const shouldQuote =
                /^(https?|ftp|postgres):\/\//.test(value) ||
                (/^[{\[]/.test(value) && /[}\]]$/.test(value)) ||
                (value.includes(',') && !/^\d+,\d+$/.test(value)) ||
                value.includes(' ');

            if (shouldQuote) {
                formattedValue = `'${value.replace(/'/g, "\\'")}'`;
            }

            return `-D${e.name}=${formattedValue}`;
        }).join(' ');
    },

    args: envs => {
        return envs
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(e => {
                const value = (e.name === 'APP_SETTINGS_JSON' && typeof e.value === 'string')
                    ? e.value
                    : JSON.stringify(e.value || '');

                return `"${e.name}": ${value}`;
            })
            .join(',\n');
    },
    default: function (envs) {
        return envs.map(e => `-D${e.name}="${e.value || ''}"`).join('\n');
    }
};

// Processa argumentos
function parseArgs() {
    const args = process.argv.slice(2);
    return {
        mode: args.includes('-env') ? 'env' :
            args.includes('-vm') ? 'vm' :
                args.includes('-args') ? 'args' : 'default',
        create: args.includes('-c'),
        help: args.includes('-h') || args.includes('--help')
    };
}

// Mostra ajuda
function showHelp() {
    console.log(`
Uso: copyvalues [opções]

Opções:
  -env      Formato para arquivo .env (VAR=valor)
  -vm       Formato para VM options ("-Dvar=valor")
  -args     Formato para JSON args ({"key":"value"})
  -c        Criar arquivo ao invés de copiar
  -h, --help Mostrar ajuda

Exemplos:
  copyvalues -env       # Copia no formato .env
  copyvalues -vm -c     # Cria arquivo vm-options.txt
`);
}

// Função principal
async function main() {
    const { mode, create, help } = parseArgs();

    if (help) {
        showHelp();
        process.exit(0);
    }

    try {
        // Busca arquivos
        const yamlFiles = findYamlFiles(process.cwd());
        if (yamlFiles.length === 0) {
            console.error('🚨 Nenhum arquivo values.yaml encontrado!');
            process.exit(1);
        }

        // Processa variáveis
        let allEnvs = [];
        for (const file of yamlFiles) {
            try {
                const content = yaml.load(fs.readFileSync(file, 'utf8'));
                if (content.env) {
                    allEnvs = allEnvs.concat(content.env);
                    console.log(`✓ ${content.env.length} variáveis em ${path.relative(process.cwd(), file)}`);
                }
            } catch (err) {
                console.warn(`⚠️ Erro ao processar ${file}: ${err.message}`);
            }
        }

        if (allEnvs.length === 0) {
            console.error('🚨 Nenhuma variável encontrada nos arquivos!');
            process.exit(1);
        }

        // Formata saída
        const output = formatters[mode](allEnvs);

        // Saída
        if (create) {
            const filename = OUTPUT_FILES[mode] || 'output.txt';
            fs.writeFileSync(filename, output);
            console.log(`\n✅ Arquivo ${filename} criado com sucesso!`);
        } else {
            clipboardy.writeSync(output);
            console.log(`\n✅ ${allEnvs.length} variáveis copiadas para o clipboard!`);
        }

        process.exit(0);

    } catch (err) {
        console.error('\n🚨 Erro:', err.message);
        process.exit(1);
    }
}

main();