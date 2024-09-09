import { IInfos, all_infos } from "@/assets/docs";
import { Button } from "./ui/button";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import axios from "axios";


export const TableLocal = () => {

  useEffect(() => {
    searchLocals()
  }, [])

  const [allItems, setAllitems] = useState([] as IInfos[])
  //@ts-ignore
  const [locals, setLocals] = useState([] as IInfos[])


  const [loading, setLoading] = useState(false)
  const [update, setUpdate] = useState(false)
  const [create, setCreate] = useState(false)

  const [item, setItem] = useState({
    id: '',
    nome: '',
    endereco: '',
    cidade: '',
    uf: '',
    ie: '',
    cnpj: '',
    telefone: ''
  })

  const editSeller = (seller: any) => {
    setItem(seller)
    setUpdate(true)
  }

  const createSeller = () => {
    setItem({
      id: '',
      nome: '',
      endereco: '',
      cidade: '',
      uf: '',
      ie: '',
      cnpj: '',
      telefone: ''
    })
    setCreate(true)
  }

  const searchItem = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name  = event.target.value

    if(name.length > 2){
      setAllitems(
        all_infos.filter(info => {
          if(info.nome.toLowerCase().includes(name.toLowerCase())){
            return info
          }
        })
      )
      return
    }

    setAllitems(all_infos)

  }


  const searchLocals = async () => {
    try {
      const url = import.meta.env.VITE_BASE_URL
      const {data} = await axios.get(`${url}/location`)
      console.log(data);
      setLocals(data)
      setAllitems(data)
    } catch (error) {
      console.log(error);
      
      setLocals([])
    }
  }


  const registerLocal = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if(update){
      await updateLocal()
      return
    }

    setLoading(true)

    try {
      const url = import.meta.env.VITE_BASE_URL
      const {data} = await axios.post(`${url}/location`, {
        nome: item.nome,
        endereco: item.endereco,
        cidade: item.cidade,
        uf: item.uf,
        ie: item.ie,
        cnpj: item.cnpj,
        telefone: item.telefone
      })  

      console.log(data);
      setItem({
        id: '',
        nome: '',
        endereco: '',
        cidade: '',
        uf: '',
        ie: '',
        cnpj: '',
        telefone: ''
      })

      await searchLocals()
      setLoading(false)
      setCreate(false)
    } catch (error) {
      alert(`erro ao salvar: ${error}`)
      setLoading(false)
    }

  }


  const updateLocal = async () => {
    setLoading(true)

    try {
      const url = import.meta.env.VITE_BASE_URL
      const {data} = await axios.put(`${url}/location/${item.id}`, {
        nome: item.nome,
        endereco: item.endereco,
        cidade: item.cidade,
        uf: item.uf,
        ie: item.ie,
        cnpj: item.cnpj,
        telefone: item.telefone
      })  

      console.log(data);
      setItem({
        id: '',
        nome: '',
        endereco: '',
        cidade: '',
        uf: '',
        ie: '',
        cnpj: '',
        telefone: ''
      })

      await searchLocals()
      setLoading(false)
      setUpdate(false)
    } catch (error) {
      alert(`erro ao editar: ${error}`)
      setLoading(false)
    }
  }


  const deleteLocal = async (id: number) => {
    setLoading(true)

    try {
      const url = import.meta.env.VITE_BASE_URL
      const {data} = await axios.delete(`${url}/location/${id}`)  

      console.log(data);

      await searchLocals()
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
        <input type="text" placeholder="pesquisar" className="border outline-none p-2 rounded max-xl:flex-1" onInput={searchItem} />
        <Button variant={'outline'} onClick={() => createSeller()} className="">
          Adicionar
        </Button>
      </div>
      <div className="xl:w-[50%] flex justify-center">
        <Table className="">
          <TableCaption>Lista de Locais</TableCaption>
          <TableHeader className="!space-y-2">
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead className="">Nome</TableHead>
              <TableHead className="">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allItems.map((info) => (
              <TableRow key={info.id}>
                <TableCell className="font-medium">{info.id}</TableCell>
                <TableCell className="">{info.nome}</TableCell>
                <TableCell className="font-medium flex gap-x-2 !max-w-[200px]">
                  <Button className="text-xs" onClick={() => editSeller(info)}>Editar</Button>
                  <Button className="text-xs bg-red-500" onClick={() => deleteLocal(Number(info.id))}>Deletar</Button>
                </TableCell>
              </TableRow>
            ))}
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
            {update ? 'Editar Local': 'Criar Local'}
            </DialogDescription>
            <form onSubmit={registerLocal} className="w-full space-y-3">
              <div className="flex flex-col items-start w-full">
                <label htmlFor="nome" className="text-sm font-bold">
                  Nome:
                </label>
                <input id="nome" type="text" value={item.nome} placeholder="Nome" className="text-sm w-full p-1 outline-none border rounded" onInput={(event: React.ChangeEvent<HTMLInputElement>) => setItem({ ...item, nome: event.target.value })}/>
              </div>
              <div className="flex flex-col items-start w-full">
                <label htmlFor="Endereço" className="text-sm font-bold">
                  Endereço:
                </label>
                <input id="Endereço" type="text" value={item.endereco} placeholder="Endereço" className="text-sm w-full p-1 outline-none border rounded" onInput={(event: React.ChangeEvent<HTMLInputElement>) => setItem({ ...item, endereco: event.target.value })}/>
              </div>
              <div className="flex flex-col items-start w-full">
                <label htmlFor="Telefone" className="text-sm font-bold">
                  Telefone:
                </label>
                <input id="Telefone" type="text" value={item.telefone} placeholder="Telefone" className="text-sm w-full p-1 outline-none border rounded" onInput={(event: React.ChangeEvent<HTMLInputElement>) => setItem({ ...item, telefone: event.target.value })}/>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-start w-full col-span-2">
                  <label htmlFor="Cidade" className="text-sm font-bold">
                    Cidade:
                  </label>
                  <input id="Cidade" type="text" value={item.cidade} placeholder="Cidade" className="text-sm w-full p-1 outline-none border rounded" onInput={(event: React.ChangeEvent<HTMLInputElement>) => setItem({ ...item, cidade: event.target.value })}/>
                </div>
                <div className="flex flex-col items-start w-full">
                  <label htmlFor="UF" className="text-sm font-bold">
                    UF:
                  </label>
                  <input id="UF" type="text" value={item.uf} placeholder="UF" className="text-sm w-full p-1 outline-none border rounded" onInput={(event: React.ChangeEvent<HTMLInputElement>) => setItem({ ...item, uf: event.target.value })}/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col items-start w-full">
                  <label htmlFor="CNPJ" className="text-sm font-bold">
                    CNPJ:
                  </label>
                  <input id="CNPJ" type="text" value={item.cnpj} placeholder="CNPJ" className="text-sm w-full p-1 outline-none border rounded" onInput={(event: React.ChangeEvent<HTMLInputElement>) => setItem({ ...item, cnpj: event.target.value })}/>
                </div>
                <div className="flex flex-col items-start w-full">
                  <label htmlFor="I.E" className="text-sm font-bold">
                    I.E:
                  </label>
                  <input id="I.E" type="text" value={item.ie} placeholder="I.E" className="text-sm w-full p-1 outline-none border rounded" onInput={(event: React.ChangeEvent<HTMLInputElement>) => setItem({ ...item, ie: event.target.value })}/>
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