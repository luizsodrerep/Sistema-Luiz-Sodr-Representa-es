$ErrorActionPreference = "Stop"

try {
    $caminho = Join-Path (Get-Location).Path "prisma\schema.prisma"

    if (-not (Test-Path -LiteralPath $caminho -PathType Leaf)) {
        throw "schema.prisma nao encontrado. Execute na pasta raiz do projeto."
    }

    $bytes = [System.IO.File]::ReadAllBytes($caminho)

    $temBom = (
        $bytes.Length -ge 3 -and
        $bytes[0] -eq 239 -and
        $bytes[1] -eq 187 -and
        $bytes[2] -eq 191
    )

    $conteudo = [System.IO.File]::ReadAllText($caminho)

    $blocos = [regex]::Matches(
        $conteudo,
        '(?ms)^model Orcamento \{.*?^\}'
    )

    if ($blocos.Count -ne 1) {
        throw "Modelo Orcamento nao encontrado de forma unica. Nenhum arquivo foi alterado."
    }

    $bloco = $blocos[0]
    $trecho = $bloco.Value

    if ($trecho -match '(?m)^[ \t]*aprovacaoCanal[ \t]+') {
        throw "Campos de aprovacao ja encontrados. Nenhum arquivo foi alterado."
    }

    $padraoClienteId = '(?m)^([ \t]*clienteId[ \t]+)String[ \t]*\r?$'

    $padraoRelacaoCliente = '(?m)^([ \t]*cliente[ \t]+)Cliente(?=[ \t]+@relation\(fields: \[clienteId\], references: \[id\], onDelete: Restrict\)[ \t]*\r?$)'

    $padraoArquivo = '(?m)^[ \t]*arquivoUrl[ \t]+String\?[ \t]*\r?$'

    if ([regex]::Matches($trecho, $padraoClienteId).Count -ne 1) {
        throw "Campo clienteId diferente do esperado. Nenhum arquivo foi alterado."
    }

    if ([regex]::Matches($trecho, $padraoRelacaoCliente).Count -ne 1) {
        throw "Relacao Cliente diferente da esperada. Nenhum arquivo foi alterado."
    }

    if ([regex]::Matches($trecho, $padraoArquivo).Count -ne 1) {
        throw "Campo arquivoUrl diferente do esperado. Nenhum arquivo foi alterado."
    }

    $trechoNovo = [regex]::Replace(
        $trecho,
        $padraoClienteId,
        '${1}String?'
    )

    $trechoNovo = [regex]::Replace(
        $trechoNovo,
        $padraoRelacaoCliente,
        '${1}Cliente?'
    )

    $quebra = if ($conteudo.Contains("`r`n")) {
        "`r`n"
    } else {
        "`n"
    }

    $camposNovos = @(
        "  aprovacaoCanal String?"
        "  aprovadoPor String?"
        "  aprovacaoReferencia String?"
        "  aprovacaoEm DateTime?"
        "  dataVendaComercial DateTime?"
        "  descontoAprovado Float?"
        "  bonificacaoAprovada Float?"
    )

    $insercao = ($camposNovos -join $quebra) + $quebra + $quebra

    $posicaoArquivo = [regex]::Match(
        $trechoNovo,
        $padraoArquivo
    )

    if (-not $posicaoArquivo.Success) {
        throw "Nao foi possivel localizar o ponto de insercao. Nenhum arquivo foi alterado."
    }

    $trechoNovo = (
        $trechoNovo.Substring(0, $posicaoArquivo.Index) +
        $insercao +
        $trechoNovo.Substring($posicaoArquivo.Index)
    )

    $novoConteudo = (
        $conteudo.Substring(0, $bloco.Index) +
        $trechoNovo +
        $conteudo.Substring($bloco.Index + $bloco.Length)
    )

    $backup = Join-Path $env:TEMP (
        "crm-schema-antes-prospeccao-" +
        [guid]::NewGuid().ToString("N") +
        ".prisma.bak"
    )

    [System.IO.File]::Copy($caminho, $backup)

    $codificacao = New-Object System.Text.UTF8Encoding($temBom)

    [System.IO.File]::WriteAllText(
        $caminho,
        $novoConteudo,
        $codificacao
    )

    Write-Host ""
    Write-Host "Modelo Orcamento preparado com sucesso."
    Write-Host "Backup: $backup"
    Write-Host "O banco de dados NAO foi alterado."
    Write-Host ""

    exit 0
}
catch {
    Write-Error $_.Exception.Message
    exit 1
}