import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { TableSeller } from "./tableSeller";
import { TableLocal } from "./tableLocal";
import { TableBanks } from "./tableBankls";
import localforage from "localforage";
import { ConfigsComponent } from "./configs";


export const Painel = () => {

    useEffect(() => {
        checkPassword(true)
    }, [])

    const [page, setPage] = useState('CONFIGURAÇÕES')

    const [pass, setPass] = useState('')
    const [loaded, setLoaded] = useState(false)

    const changePage = (item: string) => {
        return setPage(item)
    }


    const checkPassword = async (check?: boolean) => {
        const password = await localforage.getItem('password')
        if(password){
            const pass_env = import.meta.env.VITE_PASSWORD
            if(password == pass_env){
                setLoaded(true)
                return
            }
        }

        const pass_env = import.meta.env.VITE_PASSWORD
        if(pass == pass_env){
            await localforage.setItem('password', pass)
            setLoaded(true)
            return
        }

        
        if(!check){
            alert('senha incorreta')
        }
    }

    return (
        <>
            {!loaded && 
                <div className="h-screen w-full bg-zinc-200 flex items-center justify-center">
                    <div className="p-8  w-80 xl:w-96 shadow-xl bg-white rounded-md space-y-4">
                        <div className="flex flex-col">
                            <h1 className="font-bold text-xl">
                                Senha de Acesso
                            </h1>
                            <sub>
                                Digite a senha de acesso
                            </sub>
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="senha">
                                Senha: 
                            </label>
                            <input id="senha" type="password" value={pass} className="p-2 border rounded" onInput={(event: React.ChangeEvent<HTMLInputElement>) => setPass(event.target.value)} />
                            <Button onClick={() => checkPassword()} className="mt-2 rounded">
                                Acessar
                            </Button>
                        </div>
                    </div>
                </div>
            }
            {loaded &&
                <div>
                    <header className='bg-foreground text-white p-2 flex flex-col items-center'>
                        <h1 className="font-bold">{page}</h1>
                    </header> 
                    {/* {
                        page === 'CONTRATOS' && <TableContracts />
                    } */}
                    {
                        page === 'VENDEDORES' && <TableSeller />
                    }
                    {
                        page === 'LOCAIS' && <TableLocal />
                    }
                    {
                        page === 'BANCOS' && <TableBanks />
                    }
                    {
                        page === 'CONFIGURAÇÕES' && <ConfigsComponent />
                    }
                    <footer className="fixed bottom-0 h-14 w-full flex items-center justify-center px-2 bg-foreground">
                        <div className="flex items-center justify-around gap-x-2">
                            <Button variant={'link'} onClick={() => changePage('CONFIGURAÇÕES')} className="active:scale-95 transition-all text-white">
                                Config
                            </Button>
                            <Button variant={'link'} onClick={() => changePage('VENDEDORES')} className="active:scale-95 transition-all text-white">
                                Vendedores
                            </Button>
                            <Button variant={'link'} onClick={() => changePage('LOCAIS')} className="active:scale-95 transition-all text-white">
                                Locais
                            </Button>
                            <Button variant={'link'} onClick={() => changePage('BANCOS')} className="active:scale-95 transition-all text-white">
                                Bancos
                            </Button>
                        </div>
                    </footer>
                </div>
            }
        </>
    )
}