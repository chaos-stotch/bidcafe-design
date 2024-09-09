import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import axios from "axios"
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "./ui/table"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { X } from "lucide-react"
import { IInfos } from "@/assets/docs"
import { TableContracts } from "./tableContracts"


interface brokers extends IInfos {
    percent?: number
}


interface drinks {
    id:         number,
    name:       string,
    base_value: number,
    peneira:    number,
    cata:       number,
    diffpen:    number,
    diffcata:   number
}


export const ConfigsComponent = () => {

    useEffect(() => {
        getConfigs()
        getBrokers()
        getBrokersPercent()
        getDrinks()
    }, [])

    // @ts-ignore
    const [configs, setConfigs] = useState({
        date_payment: 2
    })
    
    const [create, setCreate] = useState(false)
    const [update, setUpdate] = useState(false)
    // @ts-ignore
    const [loading, setLoading] = useState(false)

    const [allBrokers, setAllBrokers] = useState([] as brokers[])
    const [allDrinks, setAllDrinks] = useState([] as drinks[])
    const [allBrokersPercents, setAllBrokersPercents] = useState([] as brokers[])

    const [list_select, setListSelect] = useState('drink')

    const [drink, setDrink] = useState({
        id: 0,
        name: '',
        base_value: 0,
        diffpen: 0,
        peneira: 0,
        diffcata: 0,
        cata: 0
    })

    const [item, setItem] = useState({
        id: '',
        nome: '',
        endereco: '',
        cidade: '',
        uf: '',
        ie: '',
        cnpj: '',
        telefone: '',
        percent: 0.4
      })
    

    const getBrokers = async () => {
        try {
            const url = import.meta.env.VITE_BASE_URL
            const {data} = await axios.get(`${url}/broker`)
            setAllBrokers(data)
        } catch (error) {
            setAllBrokers([])
        }
    }

    const getDrinks = async () => {
        try {
            const url = import.meta.env.VITE_BASE_URL
            const {data} = await axios.get(`${url}/drink`)
            setAllDrinks(data)
        } catch (error) {
            setAllDrinks([])
        }
    }

    const getBrokersPercent = async () => {
        try {
            const url = import.meta.env.VITE_BASE_URL
            const {data} = await axios.get(`${url}/broker/percent`)
            setAllBrokersPercents(data)
        } catch (error) {
            setAllBrokers([])
        }
    }

    const getConfigs = async () => {
        try {
            const url = import.meta.env.VITE_BASE_URL
            const {data} = await axios.get(`${url}/config`)

            setConfigs(data || {date_payment: 2})
        } catch (error) {
            alert('nao foi possivel pegar as configurações... tente novamente!')
        }
    }


    const sendBroker = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        try {
            const url = import.meta.env.VITE_BASE_URL
            const {data} = await axios.put(`${url}/broker/${item.id}`, {
                ...item,
                percents: item.percent
            })
            console.log(data);
            await getBrokersPercent()
            setUpdate(false)
            setCreate(false)
        } catch (error) {
            
        }
    }
    
    const sendDrink = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        try {
            const url = import.meta.env.VITE_BASE_URL
            const {data} = await axios.put(`${url}/drink/${drink.id}`, {
                ...drink,
            })
            console.log(data);
            await getDrinks()
            setUpdate(false)
            setCreate(false)
        } catch (error) {
            
        }
    }

    const updateBroker = (temp_broker: brokers) => {
        setUpdate(true)
        setItem({
            cidade: temp_broker.cidade,
            cnpj: temp_broker.cnpj,
            endereco: temp_broker.endereco,
            id: temp_broker.id,
            ie: temp_broker.ie,
            nome: temp_broker.nome,
            percent: temp_broker.percent || 0.4,
            telefone: temp_broker.telefone,
            uf: temp_broker.uf
        })
    }


    const updateDrink = (temp_drink: drinks) => {
        setUpdate(true)
        setDrink(temp_drink)
    }

    const formatMoeda = (number: string) => {
        if (!number) {
            return "R$ 0,00";
        }
        const temp_number: string = number.toString();
        const numero = parseFloat(temp_number).toFixed(2).split(".");
        
        numero[0] = numero[0].split(/(?=(?:...)*$)/).join(".");
        return `R$ ${numero.join(",")}`;
    }


    return (
        <>
            <div className="w-full p-4 flex gap-x-2 items-center justify-center">
                <Button variant={list_select === 'drink' ? 'default' : 'outline'} onClick={() => setListSelect('drink')}>
                    Bebidas
                </Button>
                <Button variant={list_select === 'conf_drink' ? 'default' : 'outline'} onClick={() => setListSelect('conf_drink')}>
                    Conf. Bebidas
                </Button>
                <Button variant={list_select === 'corretoras' ? 'default' : 'outline'} onClick={() => setListSelect('corretoras')}>
                    Corretoras
                </Button>
            </div>
            {
                list_select === 'contratos' && <TableContracts />
            }
            {
                list_select === 'corretoras' && 
                <div className="w-full p-4 flex flex-col items-center justify-center">
                    <div className="w-full flex items-center justify-end">
                        <Button variant={'outline'} onClick={() => setCreate(true)}>Adicionar</Button>
                    </div>
                    <Table className="w-full">
                        <TableCaption>Lista de Corretoras</TableCaption>
                        <TableHeader className="!space-y-2">
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead className="max-w-[120px]">Corretora</TableHead>
                                <TableHead className="">Porcentagem</TableHead>
                                <TableHead className="">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                allBrokersPercents.map(temp_broker => (
                                    <TableRow>
                                        <TableCell>
                                            {temp_broker.id}
                                        </TableCell>
                                        <TableCell>
                                            {temp_broker.nome}
                                        </TableCell>
                                        <TableCell>
                                            {temp_broker.percent}
                                        </TableCell>
                                        <TableCell>
                                            <Button onClick={() => updateBroker(temp_broker)}>
                                                Editar
                                            </Button>
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
                                {update ? 'Editar Corretagem': 'Criar Corretagem'}
                            </DialogDescription>
                            <form onSubmit={sendBroker} className="w-full space-y-3">
                                <div className="flex flex-col items-start w-full">
                                    <label htmlFor="corretora" className="text-sm font-bold">
                                        Selecione uma Corretora:
                                    </label>
                                    {   !update ?
                                        <select name="corretora" id="corretora" className="border w-full rounded p-2" onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setItem(JSON.parse(event.target.value))}>
                                            {
                                                allBrokers.map((temp) => (
                                                    <option key={temp.id} value={JSON.stringify(temp)}>
                                                        {temp.nome}
                                                    </option>
                                                ))
                                            }
                                        </select> :
                                        <input type="text" readOnly value={item.nome} />
                                    }
                                </div>
                                <div className="flex flex-col items-start w-full">
                                    <label htmlFor="" className="text-sm font-bold">
                                        Corretagem
                                    </label>
                                    <input type="number" className="border w-full rounded p-2" step={0.1} value={item.percent} onInput={(event: React.ChangeEvent<HTMLInputElement>) => setItem({...item, percent: Number(event.target.value)})} />
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
                </div>
            }
            {
                list_select === 'drink' && 
                <div className="w-full p-4 flex flex-col items-center justify-center">
                    {/* <div className="w-full flex items-center justify-end">
                        <Button variant={'outline'} onClick={() => setCreate(true)}>Adicionar</Button>
                    </div> */}
                    <Table className="w-full">
                        <TableCaption>Lista de Bebidas</TableCaption>
                        <TableHeader className="!space-y-2">
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead className="max-w-[120px]">Bebida</TableHead>
                                <TableHead className="">Base</TableHead>
                                <TableHead className="">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                allDrinks.map(temp_drink => (
                                    <TableRow>
                                        <TableCell className="whitespace-nowrap">
                                            {temp_drink.id}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {temp_drink.name}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {formatMoeda(String(temp_drink.base_value))}
                                        </TableCell>
                                        <TableCell>
                                            <Button onClick={() => updateDrink(temp_drink)}>
                                                Editar
                                            </Button>
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
                                {update ? 'Editar Bebida': 'Criar Bebida'}
                            </DialogDescription>
                            <form onSubmit={sendDrink} className="w-full space-y-3">
                                <div className="flex flex-col items-start w-full">
                                    <label htmlFor="corretora" className="text-sm font-bold">
                                        Valor Base:
                                    </label>
                                    <input type="number" value={drink.base_value} className="border w-full rounded p-2" onInput={(event: React.ChangeEvent<HTMLInputElement>) => setDrink({...drink, base_value: Number(event.target.value)})}/>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex flex-col items-start w-full">
                                        <label htmlFor="" className="text-sm font-bold">
                                            Dif Peneira
                                        </label>
                                        <input type="number" className="border w-full rounded p-2" step={0.1} value={drink.diffpen} onInput={(event: React.ChangeEvent<HTMLInputElement>) => setDrink({...drink, diffpen: Number(event.target.value)})} />
                                    </div>
                                    <div className="flex flex-col items-start w-full">
                                        <label htmlFor="" className="text-sm font-bold">
                                            Peneira
                                        </label>
                                        <input type="number" className="border w-full rounded p-2" step={0.1} value={drink.peneira} onInput={(event: React.ChangeEvent<HTMLInputElement>) => setDrink({...drink, peneira: Number(event.target.value)})} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex flex-col items-start w-full">
                                        <label htmlFor="" className="text-sm font-bold">
                                            Dif Cata
                                        </label>
                                        <input type="number" className="border w-full rounded p-2" step={0.1} value={drink.diffcata} onInput={(event: React.ChangeEvent<HTMLInputElement>) => setDrink({...drink, diffcata: Number(event.target.value)})} />
                                    </div>
                                    <div className="flex flex-col items-start w-full">
                                        <label htmlFor="" className="text-sm font-bold">
                                            Cata
                                        </label>
                                        <input type="number" className="border w-full rounded p-2" step={0.1} value={drink.cata} onInput={(event: React.ChangeEvent<HTMLInputElement>) => setDrink({...drink, cata: Number(event.target.value)})} />
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
                </div>
            }
            {
                list_select === 'conf_drink' && 
                <div className="w-full p-4 flex flex-col items-center justify-center">
                    <Table className="w-full">
                        <TableCaption>Lista de Bebidas</TableCaption>
                        <TableHeader className="!space-y-2">
                            <TableRow>
                                <TableHead className="">DIF pen</TableHead>
                                <TableHead className="">Peneira</TableHead>
                                <TableHead className="">DIF cata</TableHead>
                                <TableHead className="">Cata</TableHead>
                                <TableHead className="">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                allDrinks.map(temp_drink => (
                                    <TableRow>
                                        <TableCell className="whitespace-nowrap">
                                            {temp_drink.diffpen}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {temp_drink.peneira}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {temp_drink.diffcata}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {temp_drink.cata}
                                        </TableCell>
                                        <TableCell>
                                            <Button onClick={() => updateDrink(temp_drink)}>
                                                Editar
                                            </Button>
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
                    <Dialog open={update || create}>
                        <DialogContent className="">
                            <DialogHeader>
                                <DialogTitle className="flex items-center justify-between">
                                {update ? `Editar ${drink.name}`: 'Criar'}
                                <DialogClose onClick={() => {setUpdate(false); setCreate(false)}}>
                                    <X />
                                </DialogClose>
                                </DialogTitle>
                                <DialogDescription>
                                    {update ? `Editar Bebida ${drink.name}`: 'Criar Bebida'}
                                </DialogDescription>
                            </DialogHeader>
                                <form onSubmit={sendDrink} className="w-full space-y-3">
                                    <div className="flex flex-col items-start w-full">
                                        <label htmlFor="corretora" className="text-sm font-bold">
                                            Valor Base:
                                        </label>
                                        <input type="number" value={drink.base_value} className="border w-full rounded p-2" onInput={(event: React.ChangeEvent<HTMLInputElement>) => setDrink({...drink, base_value: Number(event.target.value)})}/>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex flex-col items-start w-full">
                                            <label htmlFor="" className="text-sm font-bold">
                                                Dif Peneira
                                            </label>
                                            <input type="number" className="border w-full rounded p-2" step={0.1} value={drink.diffpen} onInput={(event: React.ChangeEvent<HTMLInputElement>) => setDrink({...drink, diffpen: Number(event.target.value)})} />
                                        </div>
                                        <div className="flex flex-col items-start w-full">
                                            <label htmlFor="" className="text-sm font-bold">
                                                Peneira
                                            </label>
                                            <input type="number" className="border w-full rounded p-2" step={0.1} value={drink.peneira} onInput={(event: React.ChangeEvent<HTMLInputElement>) => setDrink({...drink, peneira: Number(event.target.value)})} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex flex-col items-start w-full">
                                            <label htmlFor="" className="text-sm font-bold">
                                                Dif Cata
                                            </label>
                                            <input type="number" className="border w-full rounded p-2" step={0.1} value={drink.diffcata} onInput={(event: React.ChangeEvent<HTMLInputElement>) => setDrink({...drink, diffcata: Number(event.target.value)})} />
                                        </div>
                                        <div className="flex flex-col items-start w-full">
                                            <label htmlFor="" className="text-sm font-bold">
                                                Cata
                                            </label>
                                            <input type="number" className="border w-full rounded p-2" step={0.1} value={drink.cata} onInput={(event: React.ChangeEvent<HTMLInputElement>) => setDrink({...drink, cata: Number(event.target.value)})} />
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
                        </DialogContent>
                    </Dialog>
                </div>
            }
        </>
    )
}


