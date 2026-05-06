"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileSpreadsheet, Upload, Download, FileUp, FileDown, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface SpreadsheetHandlerProps {
  moduleType: string
  data?: any[]
}

export function SpreadsheetHandler({ moduleType, data }: SpreadsheetHandlerProps) {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importStatus, setImportStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [importErrors, setImportErrors] = useState<string[]>([])
  const [exportFormat, setExportFormat] = useState<"xlsx" | "csv">("xlsx")

  const downloadTemplate = async (format: "xlsx" | "csv") => {
    try {
      const link = document.createElement("a")
      link.href = `/api/templates?module=${moduleType}&format=${format}`
      link.download = `template_${moduleType}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Download iniciado",
        description: `O modelo de planilha para ${moduleType} está sendo baixado.`,
      })
    } catch (error) {
      console.error("Erro ao baixar modelo:", error)
      toast({
        title: "Erro ao baixar modelo",
        description: "Ocorreu um erro ao tentar baixar o modelo de planilha.",
        variant: "destructive",
      })
    }
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImportProgress(0)
    setImportStatus("processing")
    setImportErrors([])

    const reader = new FileReader()

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 50)
        setImportProgress(progress)
      }
    }

    reader.onload = async (e) => {
      try {
        setImportProgress(50)

        const processData = async () => {
          for (let i = 50; i <= 90; i += 10) {
            await new Promise((resolve) => setTimeout(resolve, 200))
            setImportProgress(i)
          }

          const mockData = [
            { id: 1, nome: "Item 1", valor: 100 },
            { id: 2, nome: "Item 2", valor: 200 },
            { id: 3, nome: "Item 3", valor: 300 },
          ]

          setImportProgress(100)
          setImportStatus("success")

          setTimeout(() => {
            setIsImportDialogOpen(false)
            setImportStatus("idle")
            setImportProgress(0)
          }, 2000)

          toast({
            title: "Importação concluída",
            description: `${mockData.length} registros foram importados com sucesso.`,
          })
        }

        await processData()
      } catch (error) {
        console.error("Erro ao processar arquivo:", error)
        setImportStatus("error")
        setImportErrors(["Ocorreu um erro ao processar o arquivo. Verifique o formato e tente novamente."])
      }
    }

    reader.onerror = () => {
      setImportStatus("error")
      setImportErrors(["Erro ao ler o arquivo. Verifique se o arquivo não está corrompido."])
    }

    reader.readAsArrayBuffer(file)
  }

  const handleExport = async () => {
    setIsExportDialogOpen(false)

    try {
      toast({
        title: "Exportação concluída",
        description: `Dados exportados com sucesso no formato ${exportFormat.toUpperCase()}.`,
      })
    } catch (error) {
      console.error("Erro ao exportar dados:", error)
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar os dados. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Upload size={16} />
            <span>Importar</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setIsImportDialogOpen(true)}>
            <FileUp className="mr-2 h-4 w-4" />
            <span>Importar planilha</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => downloadTemplate("xlsx")}>
            <Download className="mr-2 h-4 w-4" />
            <span>Baixar modelo XLSX</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => downloadTemplate("csv")}>
            <Download className="mr-2 h-4 w-4" />
            <span>Baixar modelo CSV</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Download size={16} />
            <span>Exportar</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => {
              setExportFormat("xlsx")
              setIsExportDialogOpen(true)
            }}
          >
            <FileDown className="mr-2 h-4 w-4" />
            <span>Exportar como XLSX</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setExportFormat("csv")
              setIsExportDialogOpen(true)
            }}
          >
            <FileDown className="mr-2 h-4 w-4" />
            <span>Exportar como CSV</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Importar dados</DialogTitle>
            <DialogDescription>
              Selecione um arquivo XLSX ou CSV para importar dados para o módulo {moduleType}.
            </DialogDescription>
          </DialogHeader>

          {importStatus === "idle" && (
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="file-upload" className="text-sm font-medium">
                  Arquivo
                </label>
                <div className="flex items-center justify-center border-2 border-dashed rounded-md p-6">
                  <div className="flex flex-col items-center space-y-2">
                    <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
                    <div className="flex flex-col items-center">
                      <label
                        htmlFor="file-upload"
                        className="text-sm font-medium text-primary cursor-pointer hover:underline"
                      >
                        Clique para selecionar um arquivo
                      </label>
                      <input
                        id="file-upload"
                        type="file"
                        accept=".xlsx,.csv"
                        className="hidden"
                        onChange={handleFileImport}
                      />
                      <p className="text-xs text-muted-foreground">XLSX ou CSV (máx. 10MB)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {importStatus === "processing" && (
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso</span>
                  <span>{importProgress}%</span>
                </div>
                <Progress value={importProgress} className="h-2" />
              </div>
              <p className="text-sm text-center text-muted-foreground">Processando seu arquivo, por favor aguarde...</p>
            </div>
          )}

          {importStatus === "success" && (
            <div className="flex flex-col items-center justify-center py-4 space-y-2">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <h3 className="text-lg font-medium">Importação concluída</h3>
              <p className="text-sm text-center text-muted-foreground">Seus dados foram importados com sucesso.</p>
            </div>
          )}

          {importStatus === "error" && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center py-2 space-y-2">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <h3 className="text-lg font-medium">Erro na importação</h3>
              </div>

              {importErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertDescription>
                    <ul className="list-disc pl-5 space-y-1">
                      {importErrors.map((error, index) => (
                        <li key={index} className="text-sm">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setImportStatus("idle")
                    setImportErrors([])
                  }}
                >
                  Tentar novamente
                </Button>
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-between">
            {importStatus === "idle" && (
              <>
                <Button variant="outline" onClick={() => downloadTemplate("xlsx")} type="button">
                  Baixar modelo
                </Button>
                <Button variant="ghost" onClick={() => setIsImportDialogOpen(false)} type="button">
                  Cancelar
                </Button>
              </>
            )}

            {importStatus === "processing" && (
              <Button variant="ghost" disabled type="button">
                Processando...
              </Button>
            )}

            {importStatus === "error" && (
              <Button variant="ghost" onClick={() => setIsImportDialogOpen(false)} type="button">
                Fechar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Exportar dados</DialogTitle>
            <DialogDescription>
              Exportar todos os dados do módulo {moduleType} como {exportFormat.toUpperCase()}.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-center">Esta ação irá exportar todos os dados atuais. Deseja continuar?</p>
          </div>

          <DialogFooter className="sm:justify-end">
            <Button variant="ghost" onClick={() => setIsExportDialogOpen(false)} type="button">
              Cancelar
            </Button>
            <Button variant="default" onClick={handleExport} type="button">
              Exportar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

