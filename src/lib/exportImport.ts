import * as XLSX from 'xlsx'
import { supabase } from './supabase'

export async function exportDataToExcel() {
  try {
    // Fetch all tables
    const { data: sellers } = await supabase.from('sellers').select('*')
    const { data: items } = await supabase.from('items').select('*')
    const { data: orders } = await supabase.from('orders').select('*')
    const { data: payments } = await supabase.from('payments').select('*')

    const wb = XLSX.utils.book_new()
    
    if (sellers) {
      const ws = XLSX.utils.json_to_sheet(sellers)
      XLSX.utils.book_append_sheet(wb, ws, "Sellers")
    }
    if (items) {
      const ws = XLSX.utils.json_to_sheet(items)
      XLSX.utils.book_append_sheet(wb, ws, "Items")
    }
    if (orders) {
      const ws = XLSX.utils.json_to_sheet(orders)
      XLSX.utils.book_append_sheet(wb, ws, "Orders")
    }
    if (payments) {
      const ws = XLSX.utils.json_to_sheet(payments)
      XLSX.utils.book_append_sheet(wb, ws, "Payments")
    }

    XLSX.writeFile(wb, `RetroCast_Backup_${new Date().toISOString().split('T')[0]}.xlsx`)
    return true
  } catch (error) {
    console.error("Export failed", error)
    return false
  }
}

export function importDataFromExcel(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        
        const result: any = {}
        workbook.SheetNames.forEach(sheetName => {
          const roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])
          if (roa.length) result[sheetName.toLowerCase()] = roa
        })
        resolve(result)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = (err) => reject(err)
    reader.readAsBinaryString(file)
  })
}
