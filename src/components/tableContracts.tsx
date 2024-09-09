import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import axios from "axios";


interface contract {
  status: string,
  json: {
    broker: {
      address: string,
      city: string,
      cnpj: string,
      name: string,
      phone: string,
      uf: string,
      percents: number,
    },
    date_payment: number,
    banco: {
      ag: string,
      banco: string,
      cc: string,
      nb: string,
    },
    day: string,
    local: {
      address: string,
      city: string,
      cnpj: string,
      name: string,
      ie: string,
      uf: string,
    },
    rest: {
      corretagem: string,
      sacas: string,
      valor: string,
      bebida: string,
      peneira: string,
      cata: string,
      obs: string
    },
    seller: {
      address: string,
      city: string,
      cnpj: string,
      name: string,
      uf: string,
      ie: string,
      id: number,
    }
  },
  createdAt: string,
  id: number
}

export const TableContracts = () => {


  useEffect(() => {
    getContracts()
  }, [])

  const navigate = useNavigate()

  const [contracts, setContracts] = useState([] as contract[])
  //@ts-ignore
  const [contract_selected, setContractSelected] = useState({} as contract)

  const formatMoeda = (number: string) => {
    if (!number) {
      return "R$ 0,00";
    }
    const temp_number: string = number.toString();
    const numero = parseFloat(temp_number).toFixed(2).split(".");

    numero[0] = numero[0].split(/(?=(?:...)*$)/).join(".");
    return `R$ ${numero.join(",")}`;
  }

  const getContracts = async () => {
    try {
      const url = import.meta.env.VITE_BASE_URL
      const { data } = await axios.get(`${url}/contract`)

      const temp = [] as contract[]

      data.forEach((item: any) => {
        temp.push({
          ...item,
          json: JSON.parse(item.json)
        })
      });

      setContracts(temp)
    } catch (error) {
      console.log(error);
    }
  }

  const approveContract = async (tempcontract: contract) => {
    setContractSelected(tempcontract)
    try {
      const url = import.meta.env.VITE_BASE_URL
      const { data } = await axios.put(`${url}/contract/${tempcontract.id}`)
      console.log(data);
    } catch (error) {
      
    }
  }

  const navigatePage = () => {
    navigate("/")
  }

  return (
    <section className="p-2 flex flex-col items-center">
      <div className="p-2 flex w-full xl:w-[50%]  items-center justify-start gap-x-2">
        <Button onClick={() => navigatePage()} variant={'outline'} className="">
          Novo Contrato
        </Button>
      </div>
      <div className="w-full flex justify-center">
        <Table className="min-w-max overflow-x-auto">
          <TableCaption>Lista de Contratos</TableCaption>
          <TableHeader className="!space-y-2">
            <TableRow>
              <TableHead className="w-[100px]">Contrato</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Bebida</TableHead>
              <TableHead>Sacas</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map((contract) => (
              <TableRow key={contract.id}>
                <TableCell className="font-medium">{contract.id}</TableCell>
                <TableCell className="font-medium">{contract.status}</TableCell>
                <TableCell className="font-medium">{contract.json.rest.bebida}</TableCell>
                <TableCell className="font-medium">{contract.json.rest.sacas}</TableCell>
                <TableCell className="font-medium">{formatMoeda(String(Number(contract.json.rest.sacas) * Number(contract.json.rest.valor)))}</TableCell>
                <TableCell>{format(contract.createdAt, 'dd/MM/yyyy')}</TableCell>
                <TableCell className="font-medium">
                  {
                    contract.status === 'Pendente' ? 
                    <Button onClick={() => approveContract(contract)}>
                      Aprovar
                    </Button> :
                    <Button>
                      Ver PDF
                    </Button>
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}