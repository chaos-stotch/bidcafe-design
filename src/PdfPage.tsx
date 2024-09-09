import { useEffect} from "react"
import './pdfcss.css'
import { addDays, format, isWeekend, parse } from "date-fns"
import jsPDF from 'jspdf';

interface localBroker {
    name: string,
    address: string,
    city: string,
    uf: string,
    cnpj: string,
    phone: string
}

interface localseller {
    name: string,
    address: string,
    city: string,
    uf: string,
    cnpj: string,
    ie: string
}


interface localrest {
    corretagem: string,
    sacas: string,
    valor: string,
    bebida: string,
    peneira: string,
    cata: string,
    obs: string
}

interface localbanco {
    banco: string,
    ag: string,
    cc: string,
    nb: string
}


interface propsInterface {
    broker: localBroker,
    seller: localseller,
    local: localseller,
    rest: localrest,
    day: string,
    banco: localbanco,
    date_payment: number,
    dontredirect?: boolean,
    pass_user?: boolean
}

function getNextBusinessDay(date: Date) {
    let nextDate = date;

    // Enquanto a data for um fim de semana, adicione um dia
    while (isWeekend(nextDate)) {
        nextDate = addDays(nextDate, 1);
    }

    return nextDate;
}
  



export const PdfPage: React.FC<propsInterface> = ({
    broker,
    day,
    local,
    rest,
    seller,
    banco,
    date_payment,
    dontredirect,
    pass_user
}) => {

    useEffect(() => {
        // const loadAssets = async () => {
        //     const temp_broker = await localforage.getItem('broker') as localBroker
        //     const temp_seller = await localforage.getItem('seller') as localseller
        //     const temp_local = await localforage.getItem('local') as localseller
        //     const temp_day = await localforage.getItem('day') as string
        //     const temp_rest = await localforage.getItem('rest') as localrest
            
        //     if(temp_broker){
        //         setBroker(temp_broker)
        //     }
        //     if(temp_seller){
        //         setSeller(temp_seller)
        //     }
        //     if(temp_local){
        //         setLocal(temp_local)
        //     }
        //     if(temp_day) {
        //         setDay(temp_day)
        //     }
        //     if(temp_rest) {
        //         setRest(temp_rest)
        //     }
            
        // }
        
        // loadAssets().catch(e => console.log('falha ao carregar dados', e))

        printPdf()
    })

    // const pdf_ref = useRef<HTMLDivElement>(null)

    const doc = new jsPDF({
        orientation: 'portrait', // Retrato
        unit: 'mm',
        format: [210, 297],
    });

    // Convertendo para o formato "yyyy-MM-dd"
    // addDays(new Date(dataFormatada), date_payment + 1)
    
    const dataFormatada = format(getNextBusinessDay(addDays(parse(format(new Date(day), 'dd/MM/yyyy'), 'dd/MM/yyyy', new Date()), date_payment + 1)), 'yyyy-MM-dd');

    const formatMoeda = (number: string) => {
        if (!number) {
            return "R$ 0,00";
        }
        const temp_number: string = number.toString();
        const numero = parseFloat(temp_number).toFixed(2).split(".");
        
        numero[0] = numero[0].split(/(?=(?:...)*$)/).join(".");
        return `R$ ${numero.join(",")}`;
    }


    const printPdf = async () => {
        // doc.setFont('Inter-Regular', 'normal')

            // Ajustando o tamanho da página para caber em uma única página
            const width = doc.internal.pageSize.getWidth();
            const height = doc.internal.pageSize.getHeight();
            console.log(width, height);

            // Adicionando o conteúdo HTML ao PDF
            // cabeçalho
            doc.line(10,1,width - 10 ,1)
            doc.setFontSize(10)
            doc.text(`${broker.name} - ${broker.cnpj}`, 10, 8, {
                align: 'left'
            })
            doc.text(`${format(new Date(), 'dd/MM/yyyy')}`, width - 10, 8, {
                align: 'right'
            })
            doc.text(`${broker.address}`, 10, 14, {
                align: 'left'
            })
            doc.text(`${broker.city} - ${broker.uf}`, 10, 20, {
                align: 'left'
            })
            doc.text(`Tel/Cel: ${broker.phone}`, width - 10, 20, {
                align: 'right'
            })
            
            doc.line(10,24,width - 10 ,24)
            // codigo
            doc.setFontSize(12)
            console.log(doc.getFontList());
            doc.setFont('', 'bold')
            doc.text(` Confirmação de Negócio N. ${new Date().getTime()}`, 10, 34)
            doc.line(10,40,width - 10 ,40)

            // Vendedor
            doc.text(`VENDEDOR`, width / 2, 48, {
                align: 'center'
            })
            doc.setFont('', 'normal')
            doc.setFontSize(12)
            doc.text(`Nome: ${seller.name}`, 10, 54)
            doc.text(`Endereço: ${seller.address}`, 10, 60)
            doc.text(`Cidade: ${seller.city} - ${seller.uf}`, 10, 66)
            doc.text(`I.E.: ${seller.ie}`, 10, 72)
            doc.text(`CNPJ.: ${seller.cnpj}`, width - 30, 72, {
                align: 'right'
            })
            doc.line(10,78,width - 10 ,78)

            // Comprador
            doc.setFontSize(12)
            doc.setFont('', 'bold')
            doc.text(`COMPRADOR`, width / 2, 86, {
                align: 'center'
            })
            doc.setFont('', 'normal')
            doc.setFontSize(12)
            doc.text(`Nome: TPJ COMERCIO ATACADISTA DE CAFE IMP E EXP. LTDA`, 10, 92)
            doc.text(`Endereço: RUA CARANGOLA 538, CENTRO`, 10, 98)
            doc.text(`Cidade: ESPERA FELIZ - MG`, 10, 104)
            doc.text(`I.E.: 001.067.091-0082`, 10, 110)
            doc.text(`CNPJ.: 09.483.354/0001-09`, width - 30, 110, {
                align: 'right'
            })
            doc.line(10,118,width - 10 ,118)

            // Local de entrega
            doc.setFontSize(12)
            doc.setFont('', 'bold')
            doc.text(`LOCAL DE ENTREGA`, width / 2, 126, {
                align: 'center'
            })
            doc.setFont('', 'normal')
            doc.setFontSize(12)
            doc.text(`Nome: ${local.name}`, 10, 132)
            doc.text(`Endereço: ${local.address}`, 10, 138)
            doc.text(`Cidade: ${local.city} - ${local.uf}`, 10, 144)
            doc.text(`I.E.: ${local.ie}`, 10, 150)
            doc.text(`CNPJ.: ${local.cnpj}`, width - 30, 150, {
                align: 'right'
            })
            doc.line(10,158,width - 10 ,158)

            // Local de entrega
            doc.setFontSize(12)
            doc.setFont('', 'bold')
            doc.text(`ESPECIFICAÇÃO DE NEGOCIAÇÃO`, width / 2, 164, {
                align: 'center'
            })
            doc.setFont('', 'normal')
            doc.setFontSize(12)
            doc.text(`Data Negociação: ${format(new Date(), 'dd/MM/yyyy')}`, 10, 172)
            doc.text(`Corretagem: ${rest.corretagem}%`, width - 10, 172, {
                align: 'right'
            })
            doc.text(`Qtde Sacas: ${rest.sacas}`, 10, 178)
            doc.text(`Valor Unitário: ${formatMoeda(rest.valor)}`, width / 2, 178, {
                align: 'center'
            })
            doc.text(`Descrição: ${rest.bebida} ${rest.peneira}% Peneira ${rest.cata}% Cata`, 10, 184)
            doc.line(10,194,width - 10 ,194)

            // Pagamento
            doc.setFontSize(12)
            doc.setFont('', 'bold')
            doc.text(`CONDIÇÃO DE PAGAMENTO`, width / 2, 200, {
                align: 'center'
            })
            doc.setFont('', 'normal')
            doc.setFontSize(12)
            doc.text(`Data Pagamento: ${format(addDays(new Date(!pass_user ? dataFormatada : day), 1), 'dd/MM/yyyy')}`, 10, 206)
            doc.text(`Sacas: ${rest.sacas}`, width / 2, 206, {
                align: 'center'
            })
            doc.text(`Total: ${formatMoeda(String(Number(rest.valor) * Number(rest.sacas)))}`, width - 10, 206, {
                align: 'right'
            })
            doc.line(10,214,width - 10 ,214)

            // CONTA PARA DEPÓSITO
            doc.setFontSize(12)
            doc.setFont('', 'bold')
            doc.text(`CONTA PARA DEPÓSITO`, width / 2, 220, {
                align: 'center'
            })
            doc.setFont('', 'normal')
            doc.setFontSize(12)
            doc.text(`Banco: ${banco.banco}`, 10, 226)
            doc.text(`Nº Banco: ${banco.nb}`, width / 2, 226, {
                align: 'right'
            })
            doc.text(`Agência: ${banco.ag}`, 10, 232)
            doc.text(`C.C.: ${banco.cc}`, width / 2, 232, {
                align: 'right'
            })
            doc.setFont('', 'bold')
            doc.text(`COND.ENTREGA:`, 10, 238).setFont('', 'normal')
            doc.text(`POSTO`, 48, 238).setFont('', 'bold')
            doc.text(`PRAZO ENTREGA:`, width / 2 + 10, 238, {
                align: 'right'
            }).setFont('', 'normal')
            doc.text(`IMEDIATO`, (width / 2) + 33, 238, {
                align: 'right'
            }).setFont('', 'normal')
            
            doc.line(15,250,width/2.2 ,250)
            doc.setFontSize(7)
            doc.text('TPJ COMERCIO ATACADISTA DE CAFE IMPORTACAO E EXPORTACAO LTDA \n COMPRADOR', 55, 254, {
                align: 'center'
            })
            doc.line(190,250,110,250)
            doc.setFontSize(7)
            doc.text(`${seller.name} \n ${broker.name}`, 150, 254, {
                align: 'center'
            })

            // doc.output('pdfjsnewwindow', {
            //     filename: 'teste.pdf'
            // })
            doc.setProperties({title: `${rest.sacas} scs X ${formatMoeda(rest.valor)} ${rest.bebida} ${rest.peneira} pen ${rest.cata} cata.pdf`})
            window.open(doc.output('bloburl'), '_blank');
            await doc.save(`${rest.sacas} scs X ${formatMoeda(rest.valor)} ${rest.bebida} ${rest.peneira} pen ${rest.cata} cata.pdf`, {returnPromise: true})
            // const url = doc.output('datauristring')
            // setPDF(url)
            // console.log(doc.output('datauristring'));
            

            if(!dontredirect){
                window.location.reload()
            }

            // Salvando o PDF
            

            // if(pdf_ref != null){
            //     doc.html(pdf_ref.current!, {
            //         async callback(doc) {
            //             doc.save('document.pdf')
            //         }
            //     })
            // }

            // window.print()
            // window.onafterprint = () => {
            //     window.location.reload()
            // }
    }

    return (
        <>
            {/* <div ref={pdf_ref} className="text-black text-sm" style={{ width: '200mm', height: '287mm' }}>
                <hr />
                <div className="w-full p-2">
                    <div className="flex items-center justify-between pt-2">
                        <span>
                            {broker.name} - {broker.cnpj}
                        </span>
                        <span>{day}</span>
                    </div>
                    <div className="">
                        <p>{broker.address}</p>
                        <div className="flex items-center justify-between">
                            <span>{broker.city} - {broker.uf}</span>
                            <span>
                                Tel/Cel: {broker.phone}
                            </span>
                        </div>
                    </div>
                </div>
                <hr />
                <div className="py-4">
                    <span className="font-bold capitalize text-xl">
                        Confirmação de Negócio N. {new Date().getTime()}
                    </span>
                </div>
                <hr />
                <div className="p-2">
                    <div className="w-full flex items-center justify-center">
                        <span className="font-bold text-xl">VENDEDOR</span>
                    </div>
                    <p>
                        Nome: <span>{seller.name}</span>
                    </p>
                    <p>
                        Endereço: <span>{seller.address}</span>
                    </p>
                    <p>
                        Cidade: <span>{seller.city} - {seller.uf}</span>
                    </p>
                    <div className="w-[70%] flex items-center justify-between">
                         <p>
                            I.E.: <span>{seller.ie}</span>
                         </p>
                         <p>
                            CNPJ: <span>{seller.cnpj}</span>
                         </p>
                    </div>
                </div>
                <hr />
                <div className="p-2">
                    <div className="w-full flex items-center justify-center">
                        <span className="font-bold text-xl">COMPRADOR</span>
                    </div>
                    <p>
                        Nome: <span>TPJ COMERCIO ATACADISTA DE CAFE IMP E EXP. LTDA</span>
                    </p>
                    <p>
                        Endereço: <span>RUA CARANGOLA 538, CENTRO</span>
                    </p>
                    <p>
                        Cidade: <span>ESPERA FELIZ - MG</span>
                    </p>
                    <div className="w-[70%] flex items-center justify-between">
                         <p>
                            I.E.: <span>001.067.091-0082</span>
                         </p>
                         <p>
                            CNPJ: <span>09.483.354/0001-09</span>
                         </p>
                    </div>
                </div>
                <hr />
                <div className="p-2">
                    <div className="w-full flex items-center justify-center">
                        <span className="font-bold text-xl">LOCAL DE ENTREGA</span>
                    </div>
                    <p>
                        Nome: <span>{local.name}</span>
                    </p>
                    <p>
                        Endereço: <span> {local.address}</span>
                    </p>
                    <p>
                        Cidade: <span>{local.city} - {local.uf}</span>
                    </p>
                    <div className="w-[70%] flex items-center justify-between">
                         <p>
                            I.E.: <span>{local.ie}</span>
                         </p>
                         <p>
                            CNPJ: <span>{local.cnpj}</span>
                         </p>
                    </div>
                </div>
                <hr />
                <div className="p-2">
                    <div className="w-full flex items-center justify-center">
                        <span className="font-bold text-xl">ESPECIFICAÇÃO DE NEGOCIAÇÃO</span>
                    </div>
                    <div className="w-full">
                        <p>
                            Data Negociação: <span>{day}</span>
                        </p>
                        <p>
                            Corretagem: <span>{rest.corretagem}</span>
                        </p>
                    </div>
                    <div className="w-[40%] flex items-center justify-between">
                        <p>
                            Qtde Sacas: <span>{rest.sacas}</span>
                        </p>
                        <p>
                            Valor Unitário: <span>{formatMoeda(rest.valor)}</span>
                        </p>
                    </div>
                    <p>
                        Descrição: <span>{rest.bebida}</span> <span>{rest.peneira}% Peneira</span> <span>{rest.cata}% Cata</span> 
                    </p>
                </div>
                <hr />
                <div className="my-2">
                    <div className="w-full flex items-center justify-center">
                        <span className="font-bold text-xl">CONDIÇÃO DE PAGAMENTO</span>
                    </div>
                    <div className="w-full flex justify-between">
                        <p>
                            Data Pagamento: <span>{format(addDays(new Date(dataFormatada), 3), 'dd/MM/yyyy')}</span>
                        </p>
                        <p>
                            Sacas: <span>{rest.sacas}</span>
                        </p>
                        <p>
                            Total R$: <span>{formatMoeda(String(Number(rest.valor) * Number(rest.sacas)))}</span>
                        </p>
                    </div>
                </div>
                <hr />
                <div className="mt-4">
                    <div className="w-full flex items-center justify-center">
                        <span className="font-bold text-xl">CONTA PARA DEPÓSITO</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <p>
                                Banco: <span>{banco.banco}</span>
                            </p>
                        </div>
                        <div>
                            <p>
                                Nº Banco: <span>{banco.nb}</span>
                            </p>
                        </div>
                    </div>
                    <div className="w-full flex items-center justify-between">
                        <p>
                            Agência: <span>{banco.ag}</span>
                        </p>
                        <p>
                            C.C.: <span>{banco.cc}</span>
                        </p>
                    </div>
                    <div className="flex items-center justify-between w-[60%]">
                        <p>
                            <span className="font-bold">COND. ENTREGA</span>: <span>POSTO</span>
                        </p>
                        <p>
                            <span className="font-bold">PRAZO ENTREGA</span>: <span>IMEDIATO</span>
                        </p>
                    </div>
                    <div>
                        <p>
                            <span className="font-bold">OBSERVAÇÃO</span>: <span>{rest.obs}</span>
                        </p>
                    </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-2">
                    <div className="w-full flex flex-col justify-center items-center border-t-2 border-t-black/30">
                        <p className="text-center">
                            TPJ COMERCIO ATACADISTA DE CAFE IMP E EXP. LTDA                            
                        </p>
                        <span>Comprador</span>
                    </div>
                    <div className="w-full flex flex-col justify-center items-center border-t-2 border-t-black/30">
                        <p className="text-center">
                            QUINCA COFFEE COMERCIO E EXPORTACAO LTDA                            
                        </p>
                        <span>RGM CORRETORA DE CAFE EIRELI</span>
                    </div>
                </div>
            </div> */}
        </>
    )
}