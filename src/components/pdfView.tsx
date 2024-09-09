import { PdfPage } from "@/PdfPage"
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "./ui/button";

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

interface propsInterface {
    pdf?: contract
}


export const PDFView: React.FC<propsInterface> = ({ pdf }) => {

    useEffect(() => {
        if (!pdf) {
            searchPDF()
        } else {
            setPDF(pdf)
            setLoader(true)
        }

    }, [])


    const navigate = useNavigate()

    const [loader, setLoader] = useState(false)
    // const [pdf_id, setPDFID] = useState('')
    const [pdf_selected, setPDF] = useState({} as contract)

    // @ts-ignore
    const [searchParams, setSearchParams] = useSearchParams();

    const searchPDF = async () => {
        try {
            const id = searchParams.get('contract')
            const url = import.meta.env.VITE_BASE_URL
            const { data } = await axios.get(`${url}/contract/${id}`)

            setPDF({
                ...data,
                json: JSON.parse(data.json)
            })

            setLoader(true)

        } catch (error) {
            console.log(error);
            
            // navigatePage()
        }
    }

    const navigatePage = () => {
        navigate("/")
        console.log('navigate');
        
    }

    return (
        <>

            <div className="w-full flex items-center justify-center">
                <h1 className="text-xl text-center">
                    Estamos analisando sua oferta aguarde!!!!
                </h1>
                <Button onClick={() => navigatePage()}>Retornar para o inicio</Button>
            </div>
            {
                loader && <PdfPage 
                    banco={pdf_selected.json.banco}
                    broker={pdf_selected.json.broker}
                    date_payment={pdf_selected.json.date_payment}
                    day={pdf_selected.json.day}
                    local={pdf_selected.json.local}
                    rest={pdf_selected.json.rest}
                    seller={pdf_selected.json.seller}
                    dontredirect={true}
                />
            }
        </>
    )
}