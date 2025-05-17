"use client"

import Link from "next/link"
import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { PageLayout } from "@/components/page-layout"
import { NavigationButtons } from "@/components/navigation-buttons"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Plus, Save, Search, Trash, Calculator, FileText, AlertCircle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function NovaVendaPage() {
  const [produtos, setProdutos] = useState<any[]>([])
  const [formData, setFormData] = useState({
    cliente: "",
    clienteId: "",
    representada: "",
    representadaId: "",
    data: new Date().toISOString().split("T")[0],
    condicaoPagamento: "",
    formaPagamento: "",
    observacoes: "",
    frete: "0",
    desconto: "0",
  })

  const [subtotal, setSubtotal] = useState(0)
  const [total, setTotal] = useState(0)
  const [comissao, setComissao] = useState(0)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Recalcular totais quando frete ou desconto mudar
    if (name === "frete" || name === "desconto") {
      calcularTotais(
        subtotal,
        name === "frete" ? Number.parseFloat(value) || 0 : Number.parseFloat(formData.frete) || 0,
        name === "desconto" ? Number.parseFloat(value) || 0 : Number.parseFloat(formData.desconto) || 0,
      )
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const adicionarProduto = () => {
    const novoProduto = {
      id: Date.now(),
      produto: "",
      codigo: "",
      quantidade: 1,
      valorUnitario: 0,
      valorTotal: 0,
    }

    setProdutos([...produtos, novoProduto])
  }

  const removerProduto = (id: number) => {
    const produtosAtualizados = produtos.filter((p) => p.id !== id)
    setProdutos(produtosAtualizados)

    // Recalcular subtotal
    const novoSubtotal = produtosAtualizados.reduce((acc, curr) => acc + curr.valorTotal, 0)
    setSubtotal(novoSubtotal)
    calcularTotais(novoSubtotal, Number.parseFloat(formData.frete) || 0, Number.parseFloat(formData.desconto) || 0)
  }

  const atualizarProduto = (id: number, campo: string, valor: any) => {
    const produtosAtualizados = produtos.map((produto) => {
      if (produto.id === id) {
        const produtoAtualizado = { ...produto, [campo]: valor }

        // Recalcular valor total do produto se quantidade ou valor unitário mudar
        if (campo === "quantidade" || campo === "valorUnitario") {
          produtoAtualizado.valorTotal = produtoAtualizado.quantidade * produtoAtualizado.valorUnitario
        }

        return produtoAtualizado
      }
      return produto
    })

    setProdutos(produtosAtualizados)

    // Recalcular subtotal
    const novoSubtotal = produtosAtualizados.reduce((acc, curr) => acc + curr.valorTotal, 0)
    setSubtotal(novoSubtotal)
    calcularTotais(novoSubtotal, Number.parseFloat(formData.frete) || 0, Number.parseFloat(formData.desconto) || 0)
  }

  const calcularTotais = (subtotal: number, frete: number, desconto: number) => {
    const novoTotal = subtotal + frete - desconto
    setTotal(novoTotal)

    // Calcular comissão (assumindo 10%)
    setComissao(novoTotal * 0.1)
  }

  const salvarVenda = () => {
    if (!formData.cliente || !formData.representada || produtos.length === 0) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios e adicione pelo menos um produto.",
        variant: "destructive",
      })
      return
    }

    // Aqui seria implementada a lógica para salvar a venda no backend
    toast({
      title: "Venda registrada com sucesso!",
      description: `Venda para ${formData.cliente} no valor de R$ ${total.toFixed(2)} registrada.`,
    })

    // Redirecionar para a página de vendas
    window.location.href = "/vendas"
  }

  return (
    <PageLayout title="Nova Venda">
      {/* Botões de navegação */}
      <NavigationButtons backLabel="Voltar para Vendas" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Dados da Venda</CardTitle>
              <CardDescription>Preencha as informações básicas da venda</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="data">Data</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="data"
                        name="data"
                        type="date"
                        value={formData.data}
                        onChange={handleInputChange}
                        className="flex-1"
                      />
                      <Button variant="outline" size="icon" className="h-10 w-10">
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cliente">Cliente</Label>
                    <div className="flex items-center gap-2">
                      <Select
                        value={formData.cliente}
                        onValueChange={(value) => {
                          handleSelectChange("cliente", value)
                          // Simulando um ID de cliente baseado na seleção
                          handleSelectChange(
                            "clienteId",
                            value === "Distribuidora ABC"
                              ? "1"
                              : value === "Supermercado Silva"
                                ? "2"
                                : value === "Confeitaria Doce"
                                  ? "3"
                                  : "4",
                          )
                        }}
                      >
                        <SelectTrigger id="cliente" className="flex-1">
                          <SelectValue placeholder="Selecione o cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Distribuidora ABC">Distribuidora ABC</SelectItem>
                          <SelectItem value="Supermercado Silva">Supermercado Silva</SelectItem>
                          <SelectItem value="Confeitaria Doce">Confeitaria Doce</SelectItem>
                          <SelectItem value="Atacadão Produtos">Atacadão Produtos</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="icon" className="h-10 w-10">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <Label htmlFor="representada">Representada</Label>
                    <Select
                      value={formData.representada}
                      onValueChange={(value) => {
                        handleSelectChange("representada", value)
                        // Simulando um ID de representada baseado na seleção
                        handleSelectChange(
                          "representadaId",
                          value === "Descartáveis Premium"
                            ? "1"
                            : value === "Embalagens Eco"
                              ? "2"
                              : value === "Papel & Cia"
                                ? "3"
                                : "4",
                        )
                      }}
                    >
                      <SelectTrigger id="representada">
                        <SelectValue placeholder="Selecione a representada" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Descartáveis Premium">Descartáveis Premium</SelectItem>
                        <SelectItem value="Embalagens Eco">Embalagens Eco</SelectItem>
                        <SelectItem value="Papel & Cia">Papel & Cia</SelectItem>
                        <SelectItem value="Plásticos Nobre">Plásticos Nobre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="condicaoPagamento">Condição de Pagamento</Label>
                      <Select
                        value={formData.condicaoPagamento}
                        onValueChange={(value) => handleSelectChange("condicaoPagamento", value)}
                      >
                        <SelectTrigger id="condicaoPagamento">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="avista">À Vista</SelectItem>
                          <SelectItem value="30dias">30 dias</SelectItem>
                          <SelectItem value="30-60">30/60 dias</SelectItem>
                          <SelectItem value="30-60-90">30/60/90 dias</SelectItem>
                          <SelectItem value="personalizado">Personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
                      <Select
                        value={formData.formaPagamento}
                        onValueChange={(value) => handleSelectChange("formaPagamento", value)}
                      >
                        <SelectTrigger id="formaPagamento">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="boleto">Boleto Bancário</SelectItem>
                          <SelectItem value="pix">PIX</SelectItem>
                          <SelectItem value="transferencia">Transferência</SelectItem>
                          <SelectItem value="cartao">Cartão de Crédito</SelectItem>
                          <SelectItem value="cheque">Cheque</SelectItem>
                          <SelectItem value="dinheiro">Dinheiro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Produtos</CardTitle>
                <CardDescription>Adicione os produtos da venda</CardDescription>
              </div>
              <Button size="sm" onClick={adicionarProduto} className="gap-1">
                <Plus className="h-4 w-4" />
                Adicionar Produto
              </Button>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead className="w-[100px]">Qtd</TableHead>
                      <TableHead className="w-[120px]">Valor Unit.</TableHead>
                      <TableHead className="w-[120px]">Total</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {produtos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                          Nenhum produto adicionado. Clique em "Adicionar Produto" para começar.
                        </TableCell>
                      </TableRow>
                    ) : (
                      produtos.map((produto) => (
                        <TableRow key={produto.id}>
                          <TableCell>
                            <Input
                              value={produto.codigo}
                              onChange={(e) => atualizarProduto(produto.id, "codigo", e.target.value)}
                              placeholder="Código"
                              className="h-8 text-xs"
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={produto.produto}
                              onValueChange={(value) => atualizarProduto(produto.id, "produto", value)}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Selecione o produto" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Copo Descartável 200ml">Copo Descartável 200ml</SelectItem>
                                <SelectItem value="Guardanapo 30x30">Guardanapo 30x30</SelectItem>
                                <SelectItem value="Embalagem Biodegradável">Embalagem Biodegradável</SelectItem>
                                <SelectItem value="Talher Descartável">Talher Descartável</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={produto.quantidade}
                              onChange={(e) =>
                                atualizarProduto(produto.id, "quantidade", Number.parseInt(e.target.value) || 0)
                              }
                              className="h-8 text-xs"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={produto.valorUnitario}
                              onChange={(e) =>
                                atualizarProduto(produto.id, "valorUnitario", Number.parseFloat(e.target.value) || 0)
                              }
                              className="h-8 text-xs"
                              placeholder="R$ 0,00"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={`R$ ${produto.valorTotal.toFixed(2)}`}
                              readOnly
                              className="h-8 text-xs bg-muted/20"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removerProduto(produto.id)}
                              className="h-8 w-8"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Observações</CardTitle>
              <CardDescription>Informações adicionais sobre a venda</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={handleInputChange}
                placeholder="Observações sobre a venda, condições especiais, etc."
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Resumo da Venda
              </CardTitle>
              <CardDescription>Valores e totais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Subtotal:</span>
                    <span className="text-sm font-medium">R$ {subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Label htmlFor="frete" className="text-sm flex-1">
                      Frete:
                    </Label>
                    <Input
                      id="frete"
                      name="frete"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.frete}
                      onChange={handleInputChange}
                      className="w-32 h-8 text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Label htmlFor="desconto" className="text-sm flex-1">
                      Desconto:
                    </Label>
                    <Input
                      id="desconto"
                      name="desconto"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.desconto}
                      onChange={handleInputChange}
                      className="w-32 h-8 text-xs"
                    />
                  </div>

                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-base font-bold">Total:</span>
                    <span className="text-base font-bold">R$ {total.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Comissão (10%):</span>
                    <span>R$ {comissao.toFixed(2)}</span>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <h4 className="text-sm font-medium">Controle de Faturamento</h4>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      Registre o valor efetivamente faturado pela representada após a confirmação do pedido.
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="valorFaturado" className="text-sm flex-1">
                        Valor Faturado:
                      </Label>
                      <Input
                        id="valorFaturado"
                        name="valorFaturado"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder={total.toFixed(2)}
                        className="w-32 h-8 text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Label htmlFor="motivoDiferenca" className="text-sm flex-1">
                        Motivo da diferença:
                      </Label>
                      <Select>
                        <SelectTrigger id="motivoDiferenca" className="w-32 h-8 text-xs">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="estoque">Falta de estoque</SelectItem>
                          <SelectItem value="preco">Alteração de preço</SelectItem>
                          <SelectItem value="promocao">Promoção</SelectItem>
                          <SelectItem value="erro">Erro de digitação</SelectItem>
                          <SelectItem value="outro">Outro motivo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-medium">Informações Fiscais</h4>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>Tipo de Operação:</span>
                      <span>Venda de Mercadoria</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Natureza da Operação:</span>
                      <span>Venda</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CFOP:</span>
                      <span>5.102</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-medium">Datas Importantes</h4>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>Previsão de Faturamento:</span>
                      <span>7 dias após pedido</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Previsão de Entrega:</span>
                      <span>15 dias após faturamento</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Previsão de Comissão:</span>
                      <span>Dia 15 do mês seguinte</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button onClick={salvarVenda} className="gap-1">
              <Save className="h-4 w-4" />
              Finalizar Venda
            </Button>
            <Button variant="outline" className="gap-1">
              <FileText className="h-4 w-4" />
              Salvar como Rascunho
            </Button>
            <Link href="/vendas" className="w-full">
              <Button variant="outline" className="w-full">
                Cancelar
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

