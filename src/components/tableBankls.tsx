import { IInfos } from "@/assets/docs";
import { Button } from "./ui/button";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import axios from "axios";



interface bankInterface {
  ag?: string
  banco?: string
  cc?: string
  id?: number
  nb?: string
  seller_id: number
  seller_name?: string
}


export const TableBanks = () => {

  useEffect(() => {
    searchBanks()
    searchSellers()
  }, [])


  const [allItems, setAllitems] = useState([] as bankInterface[])
  const [allSellers, setSellers] = useState([] as IInfos[])
  

  const [loading, setLoading] = useState(false)

  const [update, setUpdate] = useState(false)
  const [create, setCreate] = useState(false)

  const [item, setItem] = useState({
    banco: '', 
    ag: '', 
    cc: '', 
    nb: '', 
    seller_id: '',
    id: 0
  })

  const editBank = (bank: any) => {
    setItem(bank)
    setUpdate(true)
  }

  const creatBank = () => {
    setItem({
      banco: '', 
      ag: '', 
      cc: '', 
      nb: '', 
      seller_id: '',
      id: 0
    })
    setCreate(true)
  }

  const searchBanks = async () => {
    
    try {
      const url = import.meta.env.VITE_BASE_URL
      const {data} = await axios.get(`${url}/bank`)
      console.log(data);
      setAllitems(data)
    } catch (error) {
      console.log(error);
      
      setAllitems([])
    }
  }

  const searchSellers = async () => {
    try {
      const url = import.meta.env.VITE_BASE_URL
      const {data} = await axios.get(`${url}/seller`)
      console.log(data);
      setSellers(data)
    } catch (error) {
      console.log(error);
      
      setSellers([])
    }
  }


  const registeBank = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if(update){
      await updateBank()
      return
    }

    setLoading(true)

    try {
      const url = import.meta.env.VITE_BASE_URL
      const {data} = await axios.post(`${url}/bank`, {
        banco: item.banco, 
        ag: item.ag, 
        cc: item.cc, 
        nb: item.nb, 
        seller_id: item.seller_id
      })  

      console.log(data);
      setItem({
        ag: '',
        banco: '',
        cc: '',
        id: 0,
        nb: '',
        seller_id: ''
      })

      await searchBanks()
      setLoading(false)
      setCreate(false)
    } catch (error) {
      alert(`erro ao salvar: ${error}`)
      setLoading(false)
    }

  }


  const updateBank = async () => {
    setLoading(true)

    try {
      const url = import.meta.env.VITE_BASE_URL
      const {data} = await axios.put(`${url}/bank/${item.id}`, {
        ...item
      })  

      console.log(data);
      setItem({
        ag: '',
        banco: '',
        cc: '',
        id: 0,
        nb: '',
        seller_id: ''
      })

      await searchBanks()
      setLoading(false)
      setUpdate(false)
    } catch (error) {
      alert(`erro ao editar: ${error}`)
      setLoading(false)
    }
  }


  const deleteBank = async (id: number) => {
    setLoading(true)

    try {
      const url = import.meta.env.VITE_BASE_URL
      const {data} = await axios.delete(`${url}/bank/${id}`)  

      console.log(data);

      await searchBanks()
      setLoading(false)
      setUpdate(false)
    } catch (error) {
      alert(`erro ao editar: ${error}`)
      setLoading(false)
    }
  }




  // const formatMoeda = (number: string) => {
  //   if (!number) {
  //     return "R$ 0,00";
  //   }
  //   const temp_number: string = number.toString();
  //   const numero = parseFloat(temp_number).toFixed(2).split(".");

  //   numero[0] = numero[0].split(/(?=(?:...)*$)/).join(".");
  //   return `R$ ${numero.join(",")}`;
  // }

  return (
    <section className="p-2 flex flex-col items-center">
      <div className="p-2 w-full xl:w-[50%] flex items-center justify-end gap-x-2">
        {/* <input type="text" placeholder="pesquisar" className="border outline-none p-2 rounded max-xl:flex-1" onInput={searchItem} /> */}
        <Button variant={'outline'} onClick={() => creatBank()} className="">
          Adicionar
        </Button>
      </div>
      <div className="w-full xl:w-[50%] overflow-x-auto flex justify-center">
        <Table className="min-w-max">
          <TableCaption>Lista de Bancos</TableCaption>
          <TableHeader className="!space-y-2">
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead className="max-w-[120px]">Banco</TableHead>
              <TableHead className="">Vendedor</TableHead>
              <TableHead className="">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {
              allItems.map(info => (
                <TableRow key={info.id}>
                  <TableCell className="font-medium">{info.id}</TableCell>
                  <TableCell className="max-w-[120px] text-xs">{info.banco}</TableCell>
                  <TableCell className="max-w-[120px] text-xs">{info.seller_name}</TableCell>
                  <TableCell className="font-medium flex gap-x-2 !max-w-[200px]">
                    <Button className="text-xs" onClick={() => editBank(info)}>Editar</Button>
                    <Button className="text-xs bg-red-500" onClick={() => deleteBank(info.id!)}>Deletar</Button>
                  </TableCell>
                </TableRow>
              ))
            }
          </TableBody>
          <TableFooter>
            <TableRow>
              {/* <TableCell colSpan={4}>Total</TableCell>
              <TableCell className="text-right">$2,500.00</TableCell> */}
            </TableRow>
          </TableFooter>
        </Table>
      </div>
      <Dialog open={update || create}>
        <DialogContent className="">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              {update ? 'Editar': 'Criar'}
              <DialogClose onClick={() => {setUpdate(false); setCreate(false)}}>
                <X />
              </DialogClose>
            </DialogTitle>
            <DialogDescription>
            {update ? 'Editar Banco': 'Criar Banco'}
            </DialogDescription>
            <form onSubmit={registeBank} className="w-full space-y-3">
              <div className="flex flex-col items-start w-full">
                <label htmlFor="nome" className="text-sm font-bold">
                  Nome do banco:
                </label>
                <input id="nome" type="text" value={item.banco} placeholder="Nome" className="text-sm w-full p-1 outline-none border rounded" onInput={(event: React.ChangeEvent<HTMLInputElement>) => setItem({ ...item, banco: event.target.value })}/>
              </div>
              <div className="flex flex-col items-start w-full">
                <label htmlFor="Endereço" className="text-sm font-bold">
                  Agência:
                </label>
                <input id="Endereço" type="text" value={item.ag} placeholder="Agência" className="text-sm w-full p-1 outline-none border rounded" onInput={(event: React.ChangeEvent<HTMLInputElement>) => setItem({ ...item, ag: event.target.value })}/>
              </div>
              <div className="flex flex-col items-start w-full">
                <label htmlFor="Telefone" className="text-sm font-bold">
                  Conta Corrente:
                </label>
                <input id="Telefone" type="text" value={item.cc} placeholder="Conta Corrente" className="text-sm w-full p-1 outline-none border rounded" onInput={(event: React.ChangeEvent<HTMLInputElement>) => setItem({ ...item, cc: event.target.value })}/>
              </div>
              <div className="grid">
                <div className="flex flex-col items-start w-full">
                  <label htmlFor="Cidade" className="text-sm font-bold">
                    Número do Banco:
                  </label>
                  <input id="Cidade" type="text" value={item.nb} placeholder="Número do Banco" className="text-sm w-full p-1 outline-none border rounded" onInput={(event: React.ChangeEvent<HTMLInputElement>) => setItem({ ...item, nb: event.target.value })}/>
                </div>
              </div>
              <div className="w-full">
                <div className="flex flex-col items-start w-full">
                  <label htmlFor="Vendedor" className="text-sm font-bold">
                    Vendedor:
                  </label>
                  <select required className="rounded p-1 w-full border" value={item.seller_id} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setItem({ ...item, seller_id: event.target.value })}>
                      <option value="" disabled>Selecionar Vendedor</option>
                      {allSellers.map((seller, index) => (
                          <option key={index} value={seller.id}>
                              {seller.nome}
                          </option>
                      ))}
                  </select>
                </div>
              </div>
              <div className="w-full flex items-center justify-end">
                <Button disabled={loading} className="w-full xl:w-max px-8 disabled:opacity-50">
                  {
                    loading ? 'Salvando...' : 'Salvar'
                  }
                </Button>
              </div>
            </form>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </section>
  )
}