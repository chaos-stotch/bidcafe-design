import {addDays, format} from 'date-fns';
import {useEffect, useState} from 'react';
import {PdfPage} from '../PdfPage';
import {all_address, IInfos} from '../assets/docs';
import localforage from 'localforage';
import {Button} from './ui/button';
import axios from 'axios';
import {Loader2, X} from 'lucide-react';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from './ui/dialog';
import useWebsocket from 'react-use-websocket';

interface IBroker {
  cidade: string,
  cnpj: string,
  endereco: string,
  id: string,
  ie: string,
  nome: string,
  telefone: string,
  uf: string,
  percents?: number
}

interface localBroker {
  name: string,
  address: string,
  city: string,
  uf: string,
  cnpj: string,
  phone: string,
  percents: number
}

interface localseller {
  name: string,
  address: string,
  city: string,
  uf: string,
  cnpj: string,
  ie: string,
  id: string
}

interface bankInterface {
  ag?: string;
  banco?: string;
  cc?: string;
  id?: number;
  nb?: string;
  seller_id: number;
}

interface localbanco {
  banco: string,
  ag: string,
  cc: string,
  nb: string
}

interface drinks {
  id:         number,
  name:       string,
  base_value: number,
  peneira:    number,
  diffpen: number,
  cata:       number,
  diffcata: number,
}


export const FormPdf = () => {

  useEffect(() => {
    setHasPdf(false);
    searchLocals();
    getAllSeller();
    searchBrokers();
    getConfigs();
    getDrinks();
  }, []);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const temp_pass = await localforage.getItem('pass_user');
        if (temp_pass === import.meta.env.VITE_PASSWORD_USER) {
          setHasPass(true);
        }

        const temp_broker = await localforage.getItem<localBroker>('broker');
        const temp_seller = await localforage.getItem<localseller>('seller');
        const temp_local = await localforage.getItem<localseller>('local');
        const temp_banco = await localforage.getItem<localbanco>('banco');

        const load_broker = await localforage.getItem<boolean>('load_broker');
        const load_seller = await localforage.getItem<boolean>('load_seller');
        const load_local = await localforage.getItem<boolean>('load_local');
        const load_bank = await localforage.getItem<boolean>('load_bank');
        const load_day = await localforage.getItem<string>('day');

        if (load_bank) {
          setLoadBank(true);
        }

        if (load_local) {
          setLoadLocal(true);
        }

        if (load_broker) {
          setLoadBroker(true);
        }

        if (load_seller) {
          setLoadSeller(true);
        }

        if (temp_broker) {
          setBroker(temp_broker);
        }

        if (load_day) {
          setDay(format(new Date(String(load_day)), 'dd/MM/yyyy'));
        }

        if (temp_seller) {
          if (temp_seller.id) {
            getAllBanks(temp_seller.id);
          }
          setSeller(temp_seller);
        }

        if (temp_local) {
          setLocal(temp_local);
          setShowLocal(temp_local.name);
        }

        if (temp_banco) {
          setBanco(temp_banco);
        }
      } catch (e) {
        console.log('falha ao carregar dados', e);
      }
    };

    loadAssets();
  }, []);

  //@ts-ignore
  const socketUrl = import.meta.env.VITE_WEBSOCKET_URL;
  const {lastMessage} = useWebsocket(socketUrl, {
    shouldReconnect: () => true,
  });

  useEffect(() => {
      setTimeHours(format(new Date(), 'HH:mm'))
      if (lastMessage === null) {
          return;
      }

      let data;

      try {
          data = JSON.parse(lastMessage.data);
      } catch (e) {
      }

      try {
          const cafe = data['pid-eu-8832'];

          setBolsa({
              value: cafe.last,
              max: cafe.high,
              min: cafe.low,
              pc: cafe.pc,
          });
      } catch (e) {
      }

    try {
      const dolar = data['pid-eu-2103'];

      setDolar({
        value: dolar.last,
        max: dolar.high,
        min: dolar.low,
        pc: dolar.pc,
      });
    } catch (e) {
    }
  }, [lastMessage]);

  // const connectionStatus = {
  //     [ReadyState.CONNECTING]: 'Connecting',
  //     [ReadyState.OPEN]: 'Open',
  //     [ReadyState.CLOSING]: 'Closing',
  //     [ReadyState.CLOSED]: 'Closed',
  //     [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  //   }[readyState];

  const [day, setDay] = useState(format(new Date(), 'yyyy-MM-dd'));

  const [haspdf, setHasPdf] = useState(false);

  const [bolsa, setBolsa] = useState({
    value: '-',
    max: '-',
    min: '-',
    pc: '-',
  });

  const [dolar, setDolar] = useState({
    value: '-',
    max: '-',
    min: '-',
    pc: '-',
  });

  const [timehours, setTimeHours] = useState(format(new Date(), 'HH:mm'))


  const [listBroker, setListBroker] = useState([] as IBroker[]);
  const [listSeller, setListSeller] = useState([] as IBroker[]);
  const [allSeller, setAllSeller] = useState([] as IBroker[]);
  // @ts-ignore
  const [allBroker, setAllBroker] = useState([] as IBroker[]);
  const [locals, setLocals] = useState([] as IBroker[]);
  //@ts-ignore
  const [listAddress, setListAddress] = useState(
      all_address.filter(info => info) as IInfos[]);
  const [listBanks, setBanks] = useState([] as bankInterface[]);
  const [allDrinks, setAllDrinks] = useState([] as drinks[])
  const [configs, setConfigs] = useState({
    date_payment: 2,
  });

  // password new session
  const [password, setPassword] = useState('');
  const [has_pass, setHasPass] = useState(false);
  const [showModalPass, setShowModalPass] = useState(false);

  //@ts-ignore
  const [showListLocal, setShowListLocal] = useState(false);

  const [select_local, setSelectLocal] = useState(true);

  const [loader, setLoader] = useState(true);

  const [insertbank, setInsertBank] = useState(false);
  const [load_broker, setLoadBroker] = useState(false);
  const [load_seller, setLoadSeller] = useState(false);
  const [load_local, setLoadLocal] = useState(false);
  const [load_bank, setLoadBank] = useState(false);

  // @ts-ignore
  const [visit, setVisit] = useState({
    name: '',
    phone: '',
    city: '',
  });

  const [broker, setBroker] = useState({
    name: '',
    address: '',
    city: '',
    uf: '',
    cnpj: '',
    phone: '',
    percents: 0.4,
  });

  const [seller, setSeller] = useState<localseller>({
    name: '',
    address: '',
    city: '',
    uf: '',
    cnpj: '',
    ie: '',
    id: '',
  });

  const [local, setLocal] = useState({
    name: '',
    address: '',
    city: '',
    uf: '',
    cnpj: '',
    ie: '',
  });

  const [show_local, setShowLocal] = useState('');

  const [rest, setRest] = useState({
    corretagem: '0.4',
    sacas: '',
    valor: '',
    bebida: '',
    peneira: '',
    cata: '',
    obs: '',
  });

  const [banco, setBanco] = useState({
    banco: '',
    ag: '',
    cc: '',
    nb: '',
  });

  useEffect(() => {
    if (seller) {
      console.log('carregou o vendedor');
    }
    if (local) {
      console.log('carregou o local');
    }
    if (banco) {
      console.log('carregou o local');
    }
    if(broker) {
      console.log('carregou a corretora');
    }
  }, [seller, local, banco, broker]);

  const searchBrokers = async () => {
    try {
      const url = import.meta.env.VITE_BASE_URL;
      const {data} = await axios.get(`${url}/broker`);
      setAllBroker(data);
    } catch (error) {
      setAllBroker([]);
    }
  };

  const searchLocals = async () => {
    try {
      const url = import.meta.env.VITE_BASE_URL;
      const {data} = await axios.get(`${url}/location`);
      // console.log(data);
      setLocals(data);
    } catch (error) {
      // console.log(error);

      setLocals([]);
    }
  };

  const getConfigs = async () => {
    setLoader(true);
    try {
      const url = import.meta.env.VITE_BASE_URL;
      const {data} = await axios.get(`${url}/config`);

      setConfigs(data || {date_payment: 2});
    } catch (error) {

    }
    setLoader(false);
  };


  const getDrinks = async () => {
    try {
        const url = import.meta.env.VITE_BASE_URL
        const {data} = await axios.get(`${url}/drink`)
        setAllDrinks(data)
    } catch (error) {
        setAllDrinks([])
    }
}


  const searchBroker = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value;

    if (name.length > 2) {
      try {

        const temp: IInfos[] = allBroker.filter(info => {
          const nome = info.nome.toLowerCase();
          if (nome && nome.includes(name.toLowerCase())) {
            return info;
          }
        }) as IInfos[];

        // console.log(temp);
        setListBroker(temp);
      } catch (err) {

      }
    } else {
      setListBroker([]);
    }

    setBroker({
      ...broker,
      name,
    });

    await localforage.setItem('broker', {
      ...broker,
      name: name,
    });

  };

  const selectBroker = async (tempbroker: IInfos) => {
    // console.log(tempbroker);

    setBroker({
      address: tempbroker.endereco,
      city: tempbroker.cidade,
      cnpj: tempbroker.cnpj,
      name: tempbroker.nome,
      phone: tempbroker.telefone,
      uf: tempbroker.uf,
      percents: tempbroker.percent || 0.4,
    });

    await localforage.setItem('broker', {
      address: tempbroker.endereco,
      city: tempbroker.cidade,
      cnpj: tempbroker.cnpj,
      name: tempbroker.nome,
      phone: tempbroker.telefone,
      uf: tempbroker.uf,
      percents: tempbroker.percent || 0.4,
    });

    setListBroker([]);
    // console.log(broker, tempbroker.nome);

  };

  const searchSeller = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value;

    setBanks([]);
    if (name.length > 2) {
      try {

        const temp: IInfos[] = allSeller.filter(info => {
          const nome = info.nome.toLowerCase();
          if (nome && nome.includes(name.toLowerCase())) {
            return info;
          }
        }) as IInfos[];

        // console.log(temp);

        setListSeller(temp);

      } catch (err) {

      }
    } else {
      setListSeller([]);
    }

    setSeller({
      ...seller,
      name,
    });

    await localforage.setItem('seller', {
      ...seller,
      name,
    });

  };

  const getAllSeller = async () => {
    try {
      const url = import.meta.env.VITE_BASE_URL;
      const {data} = await axios.get(`${url}/seller`);
      // console.log(data);
      setAllSeller(data);
    } catch (error) {
      // console.log(error);

      setAllSeller([]);
    }
  };

  const selectSeller = async (tempseller: IInfos) => {
    setSeller({
      address: tempseller.endereco,
      city: tempseller.cidade,
      cnpj: tempseller.cnpj,
      name: tempseller.nome,
      uf: tempseller.uf,
      ie: tempseller.ie,
      id: tempseller.id,
    });

    await localforage.setItem('seller', {
      address: tempseller.endereco,
      city: tempseller.cidade,
      cnpj: tempseller.cnpj,
      name: tempseller.nome,
      uf: tempseller.uf,
      ie: tempseller.ie,
      id: tempseller.id,
    });

    setBanco({
      ag: '',
      banco: '',
      cc: '',
      nb: '',
    });

    await getAllBanks(tempseller.id);

    setListSeller([]);
  };

  const selectNewSeller = () => {
    setLoadSeller(false);
    setLoadBank(false);
  };

  // const searchLocal = async (event: React.ChangeEvent<HTMLInputElement>) => {
  //     const name = event.target.value
  //     // console.log('ola');

  //     setLocal({
  //         ...local,
  //         name
  //     })

  //     const temp: IInfos[] = all_address.filter(info => info) as IInfos[]

  //     console.log(temp);

  //     setListAddress(temp)

  //     // if(name.length > 2) {
  //     //     try {

  //     //     } catch (err) {

  //     //     }
  //     // }

  //     await localforage.setItem('seller', {
  //         ...seller,
  //         name
  //     })
  // }

  const selectLocal = async (templocal: IInfos) => {
    // console.log(templocal);

    setLocal({
      address: templocal.endereco,
      city: templocal.cidade,
      cnpj: templocal.cnpj,
      name: templocal.nome,
      ie: templocal.ie,
      uf: templocal.uf,
    });

    setShowLocal(local.name);

    await localforage.setItem('local', {
      address: templocal.endereco,
      city: templocal.cidade,
      cnpj: templocal.cnpj,
      name: templocal.nome,
      ie: templocal.ie,
      uf: templocal.uf,
    });

    // console.log(local.name);

    setShowListLocal(false);

    // setListAddress([])
  };

  const clearBank = (insert: boolean) => {
    setInsertBank(insert);
    setBanco({
      ag: '',
      banco: '',
      cc: '',
      nb: '',
    });
  };

  const getAllBanks = async (id: any) => {
    try {
      const url = import.meta.env.VITE_BASE_URL;
      const {data} = await axios.get(`${url}/bank/seller/${id}`);
      // console.log(data);
      setBanks(data);
    } catch (error) {
      // console.log(error);
      setBanks([]);
    }
  };

  const selectBank = (temp_bank: bankInterface) => {
    setBanco({
      ag: temp_bank.ag || '',
      banco: temp_bank.banco || '',
      cc: temp_bank.cc || '',
      nb: temp_bank.nb || '',
    });
  };

  const selectRest = (bebida: string) => {
    // console.log(locals);
    // console.log(bebida);

    const find_drink = allDrinks.find(temp_drink => bebida.toLowerCase().includes(temp_drink.name.toLowerCase()))

    let temp_rest = {
      ...rest,
      bebida: bebida
    }

    if(find_drink && find_drink.name && find_drink.base_value > 0 && rest.peneira && rest.cata){
      temp_rest = {
        ...rest,
        bebida: bebida,
        // valor: `${find_drink.base_value}`
      }
    }

    if(rest.peneira && find_drink && find_drink.peneira && rest.peneira && rest.cata){
      temp_rest = {
        ...temp_rest,
        // valor: String(Number(temp_rest.valor) + (calcularVariavelExtra(Number(rest.peneira), find_drink.peneira, 70, find_drink.diffpen) * 5))
      }
    }

    if(rest.peneira && find_drink && find_drink.cata && rest.peneira && rest.cata){
      temp_rest = {
        ...temp_rest,
        // valor: String(Number(temp_rest.valor) - (calcularVariavelExtra(Number(rest.cata), find_drink.cata, 40, find_drink.diffcata) * 10))
      }
    }



    if (bebida === 'RIO') {
      setLoadLocal(false);
      setSelectLocal(false);
      const temp_local = locals[0];

      selectLocal(temp_local);
      setRest(temp_rest);
      return;
    }

    if (bebida === 'CONFORME AMOSTRA') {
      setLoadLocal(false);
      setSelectLocal(false);
      const temp_local = locals[2];

      selectLocal(temp_local);
      setRest(temp_rest);
      return;
    }
 
    if (bebida === 'DURO' || bebida === 'D. RIADO' || bebida === 'D.R.RIADO' ||
        bebida === 'RIADO RIO' || bebida === 'DESPOLPADO') {
      // setLoadLocal(false)
      // setSelectLocal(false)
      const temp_local = locals[2];

      selectLocal(temp_local);
      setRest(temp_rest);
      return
    }
    setRest(temp_rest);
    return;
  };

  const registerBank = async () => {
    setLoader(true);
    try {
      const url = import.meta.env.VITE_BASE_URL;
      const {data} = await axios.post(`${url}/bank/client`, {
        banco: banco.banco,
        ag: banco.ag,
        cc: banco.cc,
        nb: banco.nb,
        seller_id: seller.id,
      });

      console.log(data);
    } catch (error) {

    }
    setLoader(false);
  };

  const sendPdf = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const temp_drink = allDrinks.find(item => rest.bebida.toLowerCase().includes(item.name.toLowerCase()))
    
    if(Number(rest.valor) < 1000) {
      const question = window.confirm(`Valor muito baixo de R$1000,00 "Está barato, você tem certeza dessa oferta?"`)

      if(!question){
        return
      }
    }


    if(temp_drink && temp_drink.base_value){
      const temp_peneira = calcularVariavelExtra(Number(rest.peneira), temp_drink.peneira, 5, 70)
      const temp_cata = calcularVariavelExtra(Number(rest.cata), temp_drink.cata, 5, 40)
      let total_value = temp_drink.base_value

      if (temp_peneira.increments > 0) {
        total_value += temp_peneira.increments * temp_drink.diffpen;
      }
      if (temp_peneira.decrements > 0) {
          total_value -= temp_peneira.decrements * temp_drink.diffpen;
      }
      if (temp_cata.increments > 0) {
          total_value -= temp_cata.increments * temp_drink.diffcata;
      }
      if (temp_cata.decrements > 0) {
          total_value += temp_cata.decrements * temp_drink.diffcata;
      }

      console.log(rest.valor, total_value);
      if(Number(rest.valor) > total_value){
        alert("No momento, não é possível registrar esta oferta. Por favor, aguarde uma melhora nas cotações do mercado ou considere abaixar o valor da oferta para um preço mais competitivo.")
        return
      }
    }
  
    rest.corretagem = String(broker.percents) || '0.4';

    if (broker.name && broker.address && broker.cnpj) {
      await localforage.setItem('load_broker', true);
    }

    if (seller.name && seller.address && seller.cnpj) {
      await localforage.setItem('load_seller', true);
    }

    if (seller.id) {
      await registerBank();
    }

    if (banco.banco && banco.ag && banco.cc && banco.nb) {
      await localforage.setItem('load_bank', true);
    }

    if (!local.name || !local.address || !local.cnpj || !local.city) {
      alert('preencha ou selecione um local de entrega');
      return;
    } else {
      await localforage.setItem('load_local', true);
    }

    await localforage.setItem('broker', broker);
    await localforage.setItem('seller', seller);
    await localforage.setItem('local', local);
    await localforage.setItem('rest', rest);
    await localforage.setItem('banco', banco);
    await localforage.setItem('day', format(new Date(day), 'dd/MM/yyyy'));
    setHasPdf(true);
    // console.log(haspdf);
  };


  const setPeneiraAndCata = (value: string, type: 'peneira' | 'cata') => {
    console.log(value);
    
    if(isNaN(Number(value))){
      alert('digite um valor valido')
      return
    }

    
    const temp_drink = allDrinks.find(item => rest.bebida.toLowerCase().includes(item.name.toLowerCase()))
    
    if(type == 'peneira'){
      setRest({
        ...rest,
        peneira: value,
        // valor: String(temp_drink?.base_value)
      })
    }

    if(type == 'cata'){
      setRest({
        ...rest,
        cata: value,
        // valor:  String(temp_drink?.base_value)
      })
    }

    if(temp_drink && temp_drink.name && type === 'peneira'){
      if(Number(rest.valor) > 0) {
        // const temp_value = Number(value)
        setRest({
          ...rest,
          peneira: value,
          // valor: String(Number(rest.valor) + calcularVariavelExtra(temp_value, 5, 5, temp_drink.peneira, 70))
        })
      }
    }

    if(temp_drink && temp_drink.name && type === 'cata'){
      if(Number(rest.valor) > 0) {
        // const temp_value = Number(value)
        setRest({
          ...rest,
          cata: value,
          // valor: String(Number(rest.valor) - calcularVariavelExtra(temp_value, 5, 10, temp_drink.cata, 40))
        })
      }
    }
  }

  const calcularVariavelExtra = (start: number, base: number, step: number, max: number) => {
    let result = {
        increments: 0,
        decrements: 0
    };

    if (start > base) {
        let current = base;
        while (current < start && current + step <= max) {
            current += step;
            result.increments++;
        }
    } else if (start < base) {
        let current = base;
        while (current > start) {
            current -= step;
            result.decrements++;
        }
    }

    return result;
}


  // const createContract = async () => {
  //     setLoader(true)
  //     try {
  //         const url = import.meta.env.VITE_BASE_URL
  //         const {data} = await axios.post(`${url}/contract`, {
  //             json: JSON.stringify({
  //                 broker: broker,
  //                 date_payment: configs.date_payment,
  //                 banco: banco,
  //                 day: day,
  //                 local: local,
  //                 rest: rest,
  //                 seller: seller
  //             })
  //         })
  //         console.log(data);
  //         return data.id
  //       } catch (error) {
  //         console.log(error);
  //       }
  //     setLoader(false)
  // }

  const formatMoeda = (number: string) => {
    if (!number) {
      return 'R$ 0,00';
    }
    const temp_number: string = number.toString();
    const numero = parseFloat(temp_number).toFixed(2).split('.');

    numero[0] = numero[0].split(/(?=(?:...)*$)/).join('.');
    return `R$ ${numero.join(',')}`;
  };

  const sendWpp = async () => {
    const temp_drink = allDrinks.find(item => rest.bebida.toLowerCase().includes(item.name.toLowerCase()))
    
    if(Number(rest.valor) < 1000 && Number(rest.valor) > 0) {
      const question = window.confirm(`Valor muito baixo de R$1000,00 "Está barato, você tem certeza dessa oferta?"`)

      if(!question){
        return
      }
    }

    if(temp_drink && temp_drink.base_value){

      const temp_peneira = calcularVariavelExtra(Number(rest.peneira), temp_drink.peneira, 5, 70)
      const temp_cata = calcularVariavelExtra(Number(rest.cata), temp_drink.cata, 5, 40)
      let total_value = temp_drink.base_value

      if (temp_peneira.increments > 0) {
        total_value += temp_peneira.increments * temp_drink.diffpen;
      }
      if (temp_peneira.decrements > 0) {
          total_value -= temp_peneira.decrements * temp_drink.diffpen;
      }
      if (temp_cata.increments > 0) {
          total_value -= temp_cata.increments * temp_drink.diffcata;
      }
      if (temp_cata.decrements > 0) {
          total_value += temp_cata.decrements * temp_drink.diffcata;
      }

      console.log(rest.valor, total_value);
      if(Number(rest.valor) > total_value){
        alert("No momento, não é possível registrar esta oferta. Por favor, aguarde uma melhora nas cotações do mercado ou considere abaixar o valor da oferta para um preço mais competitivo.")
        return
      }
    }

    if(Number(rest.cata) > 40){
      alert("No momento, não é possível registrar esta oferta. considere abaixar a cata do café para um preço um preço melhor.")
      return
    }
  

    if (has_pass) {
      if (!seller.name || !seller.cnpj || !seller.address) {
        alert('para fazer uma oferta preencha todos os campos do vendedor');
        return;
      }
      if (!broker.name || !broker.cnpj || !broker.address) {
        alert('para fazer uma oferta preencha todos os campos da corretora');
        return;
      }

      if (!rest.sacas || !rest.valor || !rest.peneira || !rest.bebida ||
          !rest.cata) {
        alert('para fazer uma oferta por favor preencha todos os campos');
        return;
      }
    } else {
      // if(!visit.name || !visit.city || !visit.phone){
      //     alert("para fazer uma oferta preencha todos os campos nome, cidade e telefone")
      //     return
      // }
      if (!rest.sacas || !rest.valor || !rest.peneira || !rest.bebida ||
          !rest.cata) {
        alert('para fazer uma oferta por favor preencha todos os campos');
        return;
      }
    }
    // const url = window.location.href
    // const contract_id = await createContract()
    // const phone = `5585996891799`
    const phone = `5533984029057`;
    // const message = `${rest.bebida}\n${rest.sacas} sacas\nPreço ${Number(rest.valor) * Number(rest.sacas)}\n${rest.cata}% cata ${rest.peneira} peneira\nLink: ${url}pdf?contract=${contract_id}`
    const message = `${visit.name}\n${rest.bebida}\n${rest.peneira}% peneira\n${rest.cata}% cata\n${rest.sacas} sacas\nPreço ${formatMoeda(
        String(rest.valor))}`;
    window.open(`whatsapp://send?phone=${phone}&text=${encodeURI(message)}`,
        '_blank');
  };

  const checkPassword = async () => {
    const pass = import.meta.env.VITE_PASSWORD_USER;

    if (pass !== password) {
      alert('Senha Errada');
      return;
    }

    await localforage.setItem('pass_user', password);
    setHasPass(true);
    setShowModalPass(false);

  };

  return (
      <>
        {
            !haspdf &&
            <div className="h-screen overflow-y-auto pb-10 bg-gradient-to-t from-[#BBD08B] to-[#2A583B]">
                <header className="bg-amber-950 text-white p-2 flex flex-col items-end">
                    <h1 className="font-bold">Registrar Oferta de Café</h1>
                </header>
                <main className="flex flex-col items-center">
                  {/* Data atual */}
                    <section className="p-2 w-full">
                            <span className="w-full flex items-center justify-end text-white">
                                {format(new Date(), 'dd/MM/yyyy')}
                            </span>
                    </section>
                  {/* formulario */}
                    <form
                        onSubmit={sendPdf}
                        className="w-[95%] xl:w-[40%] bg-[#CA945E] p-2 rounded"
                    >
                      {/* Corretora */}
                      {
                          !has_pass &&
                          <>
                              <Button
                                  onClick={() => setShowModalPass(true)}
                                  variant={'outline'}
                                  className="!text-white mb-2 rounded border-black !bg-zinc-800/90"
                              >
                                  Corretora
                              </Button>
                              <hr className="-translate-y-2"/>
                          </>
                      }
                        <div className="flex gap-x-2">
                          {load_broker && <Button
                              type="button"
                              variant={'outline'}
                              onClick={() => setLoadBroker(false)}
                              className="!text-white rounded border-black !bg-zinc-800/90"
                          >Corretora</Button>}
                          {load_seller && <Button
                              type="button"
                              variant={'outline'}
                              onClick={() => selectNewSeller()}
                              className="!text-white rounded border-black !bg-zinc-800/90"
                          >Vendedor</Button>}
                          {load_local && <Button
                              type="button"
                              variant={'outline'}
                              onClick={() => setLoadLocal(false)}
                              className="!text-white rounded border-black !bg-zinc-800/90"
                          >Local</Button>}
                          {load_bank && <Button
                              type="button"
                              variant={'outline'}
                              onClick={() => setLoadBank(false)}
                              className="!text-white rounded border-black !bg-zinc-800/90"
                          >Banco</Button>}
                        </div>
                        <div className="w-full grid grid-cols-2">
                            <div className="col-span-full flex flex-col items-center justify-center">
                                <h1 className="font-black uppercase">Cotações</h1>
                                <div className='w-max px-4 rounded-full flex items-center justify-center text-white font-bold'>
                                  <span>{timehours}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-center justify-center">
                                <h1 className="font-black uppercase">Bolsa
                                                                     Ny</h1>
                                <div className="grid grid-cols-2  gap-2">
                                  {/* <div className="text-center">
                                            <h1>BOLSA</h1>
                                            
                                        </div> */}
                                    <div className="text-center">
                                        <h1>MAX.</h1>
                                        <p className="font-bold text-blue-500">{bolsa.max}</p>
                                    </div>
                                    <div className="text-center">
                                        <h1>MIN.</h1>
                                        <p className="font-bold text-red-500">{bolsa.min}</p>
                                    </div>
                                    <div className="col-span-full text-center flex items-center space-x-2">
                                        <p className="font-bold text-white">{bolsa.value}</p>
                                        <p
                                            className={Number(
                                                bolsa.pc.replace(',', '.')) < 0
                                                ? 'text-red-500 font-bold text-3xl'
                                                : 'text-blue-500 font-bold text-3xl'}
                                        >{bolsa.pc}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-center justify-center">
                                <h1 className="font-black uppercase">Dólar</h1>
                                <div className="grid grid-cols-2  gap-2">
                                  {/* <div className="text-center">
                                            <h1>DÓLAR</h1>
                                            
                                        </div> */}
                                    <div className="text-center">
                                        <h1>MAX.</h1>
                                        <p className="font-bold text-blue-500">{dolar.max}</p>
                                    </div>
                                    <div className="text-center">
                                        <h1>MIN.</h1>
                                        <p className="font-bold text-red-500">{dolar.min}</p>
                                    </div>
                                    <div className="col-span-full text-center flex items-center space-x-2">
                                        <p className="font-bold text-white text-3xl">{dolar.value}</p>
                                        <p
                                            className={Number(
                                                dolar.pc.replace(',', '.')) < 0
                                                ? 'text-red-500 font-bold'
                                                : 'text-blue-500 font-bold'}
                                        >{dolar.pc}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                      {
                          !load_broker && has_pass &&
                          <div className="space-y-2 mt-2 pb-2">
                                    <span className="font-bold uppercase">
                                        Corretora
                                    </span>
                            {/* Razao Social */}
                              <div className="flex flex-col">
                                  <label htmlFor="" className="">Razao
                                                                 Social</label>
                                  <input
                                      required
                                      type="text"
                                      className="rounded p-2"
                                      value={broker.name}
                                      onInput={searchBroker}
                                  />
                                {
                                    listBroker.length > 0 &&
                                    <div className="h-40 w-full bg-zinc-900/20 overflow-y-auto">
                                      {
                                        listBroker.map(temp_broker => (
                                            <div
                                                onClick={() => selectBroker(
                                                    temp_broker)}
                                                key={temp_broker.id}
                                                className="text-white text-sm cursor-pointer hover:bg-zinc-900/50 border-y p-1"
                                            >
                                              {temp_broker.nome}
                                            </div>
                                        ))
                                      }
                                    </div>
                                }
                              </div>
                            {/* Endereço */}
                              <div className="grid xl:grid-cols-3 gap-2">
                                  <div className="flex flex-col">
                                      <input
                                          required
                                          type="text"
                                          placeholder="ENDEREÇO"
                                          className="rounded p-2"
                                          value={broker.address}
                                          onInput={(event: React.ChangeEvent<HTMLInputElement>) => setBroker(
                                              {
                                                ...broker,
                                                address: event.target.value,
                                              })}
                                      />
                                  </div>
                                  <div className="xl:col-span-2 grid grid-cols-2 gap-2">
                                      <div className="flex flex-col">
                                          <input
                                              required
                                              type="text"
                                              placeholder="CIDADE"
                                              className="rounded p-2"
                                              value={broker.city}
                                              onInput={(event: React.ChangeEvent<HTMLInputElement>) => setBroker(
                                                  {
                                                    ...broker,
                                                    city: event.target.value,
                                                  })}
                                          />
                                      </div>
                                      <div className="flex flex-col">
                                          <input
                                              required
                                              type="text"
                                              placeholder="UF"
                                              className="rounded p-2 w-10"
                                              value={broker.uf}
                                              onInput={(event: React.ChangeEvent<HTMLInputElement>) => setBroker(
                                                  {
                                                    ...broker,
                                                    uf: event.target.value,
                                                  })}
                                          />
                                      </div>
                                  </div>
                              </div>
                            {/* infos */}
                              <div className="grid grid-cols-2 gap-2">
                                  <div className="flex flex-col">
                                      <label
                                          htmlFor=""
                                          className=""
                                      >CNPJ</label>
                                      <input
                                          required
                                          type="text"
                                          placeholder="CNPJ"
                                          className="rounded p-2"
                                          value={broker.cnpj}
                                          onInput={(event: React.ChangeEvent<HTMLInputElement>) => setBroker(
                                              {
                                                ...broker,
                                                cnpj: event.target.value,
                                              })}
                                      />
                                  </div>
                                  <div className="flex flex-col">
                                      <label
                                          htmlFor=""
                                          className=""
                                      >Telefone</label>
                                      <input
                                          type="tel"
                                          placeholder="Telefone"
                                          className="rounded p-2"
                                          value={broker.phone}
                                          onInput={(event: React.ChangeEvent<HTMLInputElement>) => setBroker(
                                              {
                                                ...broker,
                                                phone: event.target.value,
                                              })}
                                      />
                                  </div>
                              </div>
                          </div>
                      }
                      {
                          !load_broker && has_pass && <hr/>
                      }
                      {/* Vendedor */}
                      {/* <code>{JSON.stringify([load_seller, has_pass])}</code> */}
                      {
                          !load_seller && has_pass &&
                          <div className="space-y-2 mt-2">
                                    <span className="font-bold uppercase">
                                        Vendedor
                                    </span>
                            {/* Razao Social */}
                              <div className="flex flex-col">
                                  <label htmlFor="" className="">Razao
                                                                 Social</label>
                                  <input
                                      required
                                      type="text"
                                      className="rounded p-2"
                                      value={seller.name}
                                      onInput={searchSeller}
                                  />
                                {
                                    listSeller.length > 0 &&
                                    <div className="h-40 w-full bg-zinc-900/20 overflow-y-auto">
                                      {
                                        listSeller.map(temp_seller => (
                                            <div
                                                onClick={() => selectSeller(
                                                    temp_seller)}
                                                key={temp_seller.id}
                                                className="text-white text-sm cursor-pointer hover:bg-zinc-900/50 border-y p-1"
                                            >
                                              {temp_seller.nome}
                                            </div>
                                        ))
                                      }
                                    </div>
                                }
                              </div>
                            {/* Endereço */}
                              <div className="grid xl:grid-cols-3 gap-2">
                                  <div className="flex flex-col">
                                      <input
                                          required
                                          type="text"
                                          placeholder="ENDEREÇO"
                                          className="rounded p-2"
                                          value={seller.address}
                                          onInput={(event: React.ChangeEvent<HTMLInputElement>) => setSeller(
                                              {
                                                ...seller,
                                                address: event.target.value,
                                              })}
                                      />
                                  </div>
                                  <div className="xl:col-span-2 grid grid-cols-2 gap-2">
                                      <div className="flex flex-col">
                                          <input
                                              required
                                              type="text"
                                              placeholder="CIDADE"
                                              className="rounded p-2"
                                              value={seller.city}
                                              onInput={(event: React.ChangeEvent<HTMLInputElement>) => setSeller(
                                                  {
                                                    ...seller,
                                                    city: event.target.value,
                                                  })}
                                          />
                                      </div>
                                      <div className="flex flex-col">
                                          <input
                                              required
                                              type="text"
                                              placeholder="UF"
                                              className="rounded p-2 w-10"
                                              value={seller.uf}
                                              onInput={(event: React.ChangeEvent<HTMLInputElement>) => setSeller(
                                                  {
                                                    ...seller,
                                                    uf: event.target.value,
                                                  })}
                                          />
                                      </div>
                                  </div>
                              </div>
                            {/* infos */}
                              <div className="grid grid-cols-2 gap-2">
                                  <div className="flex flex-col">
                                      <label
                                          htmlFor=""
                                          className=""
                                      >CNPJ</label>
                                      <input
                                          required
                                          type="text"
                                          placeholder="CNPJ"
                                          className="rounded p-2"
                                          value={seller.cnpj}
                                          onInput={(event: React.ChangeEvent<HTMLInputElement>) => setSeller(
                                              {
                                                ...seller,
                                                cnpj: event.target.value,
                                              })}
                                      />
                                  </div>
                                  <div className="flex flex-col">
                                      <label
                                          htmlFor=""
                                          className=""
                                      >I.E.</label>
                                      <input
                                          type="text"
                                          placeholder="I.E"
                                          className="rounded p-2"
                                          value={seller.ie}
                                          onInput={(event: React.ChangeEvent<HTMLInputElement>) => setSeller(
                                              {
                                                ...seller,
                                                ie: event.target.value,
                                              })}
                                      />
                                  </div>
                              </div>
                          </div>
                      }
                        <hr/>
                      {/* Local */}
                      {
                          !load_local && has_pass &&
                          <div className="space-y-2 mt-2 pb-2">
                                    <span className="font-bold uppercase">
                                        Local Entrega
                                    </span>
                            {/* Razao Social */}
                              <div className="flex flex-col relative">
                                {select_local && <Button
                                    className="absolute right-0 -top-5"
                                    onClick={() => setSelectLocal(false)}
                                >Digitar</Button>}
                                {!select_local && <Button
                                    className="absolute right-0 -top-5"
                                    onClick={() => setSelectLocal(true)}
                                >Selecionar</Button>}
                                  <label htmlFor="" className="">Razao
                                                                 Social</label>
                                {
                                    !select_local && <input
                                        required
                                        type="text"
                                        className="rounded p-2"
                                        value={local.name}
                                        onInput={(event: React.ChangeEvent<HTMLInputElement>) => setLocal(
                                            {...local, name: event.target.value})}
                                    />
                                }

                                {
                                    select_local &&
                                    <select
                                        className="rounded p-1 mt-4"
                                        onChange={(event: React.ChangeEvent<HTMLSelectElement>) => selectLocal(
                                            JSON.parse(event.target.value))}
                                    >
                                        <option
                                            value=""
                                            selected
                                            disabled
                                        >{show_local
                                            ? show_local
                                            : 'Selecionar Local'}</option>
                                      {locals.map((temp_local) => (
                                          <option
                                              key={temp_local.id}
                                              value={JSON.stringify(temp_local)}
                                          >
                                            {temp_local.nome}
                                          </option>
                                      ))}
                                    </select>
                                }
                              </div>
                            {
                                !select_local &&
                                <>
                                    <div className="grid xl:grid-cols-3 gap-2">
                                        <div className="flex flex-col">
                                            <input
                                                required
                                                type="text"
                                                placeholder="ENDEREÇO"
                                                className="rounded p-2"
                                                value={local.address}
                                                onInput={(event: React.ChangeEvent<HTMLInputElement>) => setLocal(
                                                    {
                                                      ...local,
                                                      address: event.target.value,
                                                    })}
                                            />
                                        </div>
                                        <div className="xl:col-span-2 grid grid-cols-2 gap-2">
                                            <div className="flex flex-col">
                                                <input
                                                    required
                                                    type="text"
                                                    placeholder="CIDADE"
                                                    className="rounded p-2"
                                                    value={local.city}
                                                    onInput={(event: React.ChangeEvent<HTMLInputElement>) => setLocal(
                                                        {
                                                          ...local,
                                                          city: event.target.value,
                                                        })}
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <input
                                                    required
                                                    type="text"
                                                    placeholder="UF"
                                                    className="rounded p-2 w-10"
                                                    value={local.uf}
                                                    onInput={(event: React.ChangeEvent<HTMLInputElement>) => setLocal(
                                                        {
                                                          ...local,
                                                          uf: event.target.value,
                                                        })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex flex-col">
                                            <label
                                                htmlFor=""
                                                className=""
                                            >CNPJ</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="CNPJ"
                                                className="rounded p-2"
                                                value={local.cnpj}
                                                onInput={(event: React.ChangeEvent<HTMLInputElement>) => setLocal(
                                                    {
                                                      ...local,
                                                      cnpj: event.target.value,
                                                    })}
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <label
                                                htmlFor=""
                                                className=""
                                            >I.E.</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="I.E"
                                                className="rounded p-2"
                                                value={local.ie}
                                                onInput={(event: React.ChangeEvent<HTMLInputElement>) => setLocal(
                                                    {
                                                      ...local,
                                                      ie: event.target.value,
                                                    })}
                                            />
                                        </div>
                                    </div>
                                </>
                            }
                          </div>
                      }
                        <hr/>
                      {/* Produto */}
                        <div className="space-y-2">
                          {/* Corretagem */}
                          {/* <div className="flex max-xl:flex-col xl:items-center xl:space-x-2">
                                    <label htmlFor="">Corretagem (%)</label>
                                    <input required type="number" step={0.1} min={0.4} value={rest.corretagem} className="rounded p-1" onInput={(event: React.ChangeEvent<HTMLInputElement>) => setRest({ ...rest, corretagem: event.target.value })} />
                                </div> */}
                          {/* sacas/valor */}
                            <div className="flex items-center gap-2">
                              {/* sacas */}
                                <div className="flex max-xl:flex-col max-xl:space-y-4 xl:items-center xl:space-x-2">
                                    <div className="flex flex-col">
                                        <label htmlFor="">Sacas</label>
                                        <sub>
                                            Insira a quantidade
                                        </sub>
                                    </div>
                                    <input
                                        required
                                        type="number"
                                        className="rounded p-1 w-full"
                                        value={rest.sacas}
                                        onInput={(event: React.ChangeEvent<HTMLInputElement>) => setRest(
                                            {
                                              ...rest,
                                              sacas: event.target.value,
                                            })}
                                    />
                                </div>
                                <div className="w-full">
                                    <div className="flex flex-col">
                                        <label htmlFor="">Descrição</label>
                                        <sub>
                                            Descrição café
                                        </sub>
                                    </div>
                                    <select
                                        required
                                        className="w-full rounded p-1 mt-4"
                                        value={rest.bebida}
                                        onChange={(event: React.ChangeEvent<HTMLSelectElement>) => selectRest(
                                            event.target.value)}
                                    >
                                        <option value="" disabled>Selecione a
                                                                  Bebida
                                        </option>
                                        {allDrinks.map((temp_drink) => {
                                          if(!["d.r.rio", "riado rio", "conforme amostra"].includes(temp_drink.name.toLowerCase())){
                                            return (
                                              <option
                                                  key={temp_drink.id}
                                                  value={JSON.stringify(temp_drink.name)}
                                              >
                                                {temp_drink.name}
                                              </option>
                                            )
                                          }
                                        })}
                                        {/* <option value="DURO">DURO</option>
                                        <option value="D. RIADO">D. RIADO
                                        </option>
                                        <option value="D.R.RIO">D.R.RIO</option>
                                        <option value="D.R.1RIO">D.R.1RIO</option>
                                        <option value="D.R.2RIO">D.R.2RIO</option>
                                        <option value="D.R.3RIO">D.R.3RIO</option>
                                        <option value="RIADO RIO">RIADO RIO
                                        </option>
                                        <option value="RIO">RIO</option>
                                        <option value="DESPOLPADO">DESPOLPADO</option> */}
                                      {/* <option value="DESPOLPADO DURO RIADO">DESPOLPADO DURO RIADO</option>
                                            <option value="DESPOLPADO DURO RIADO RIO">DESPOLPADO DURO RIADO RIO</option> */}
                                        {
                                          has_pass && <option value="CONFORME AMOSTRA">CONFORME
                                            AMOSTRA
                                          </option>
                                        }
                                    </select>
                                </div>
                            </div>
                          {/* descriçao */}
                            <div className="flex max-xl:flex-col py-2">
                              {/* descriçao */}
                                <div className="flex max-xl:flex-col max-xl:space-y-4 xl:items-center xl:space-x-2">

                                    <div className="w-full flex items-center gap-x-2">
                                        <input
                                            required
                                            placeholder="Peneira"
                                            type="number"
                                            min={0}
                                            max={80}
                                            className="rounded p-1 xl:mt-3 max-xl:flex-1 min-w-16"
                                            value={rest.peneira}
                                            onInput={(event: React.ChangeEvent<HTMLInputElement>) => setPeneiraAndCata(event.target.value, 'peneira')}
                                        />
                                        <input
                                            required
                                            placeholder="Cata"
                                            type="number"
                                            min={0}
                                            max={80}
                                            className="rounded p-1 xl:mt-3 max-xl:flex-1 min-w-14"
                                            value={rest.cata}
                                            onInput={(event: React.ChangeEvent<HTMLInputElement>) => setPeneiraAndCata(event.target.value, 'cata')}
                                        />
                                        {has_pass && <input
                                            required
                                            placeholder="Dia Pagamento"
                                            type="date"
                                            className="rounded p-1 xl:mt-3 max-xl:flex-1 min-w-20"
                                            value={format(addDays(new Date(day), 1), 'yyyy-MM-dd')}
                                            onInput={(event: React.ChangeEvent<HTMLInputElement>) => setDay(event.target.value)}
                                        />}
                                      {/* valor */}
                                        <input
                                            required
                                            placeholder="Valor por saca"
                                            type="number"
                                            className="rounded p-1 w-full"
                                            value={rest.valor}
                                            onInput={(event: React.ChangeEvent<HTMLInputElement>) => setRest(
                                                {
                                                  ...rest,
                                                  valor: event.target.value,
                                                })}
                                        />
                                    </div>
                                  {/* <select required className="rounded p-1 mt-4" value={rest.peneira} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setRest({ ...rest, peneira: event.target.value })}>
                                            <option value="" disabled>Peneira</option>
                                            {Array.from({ length: 80 }).map((_, index) => (
                                                <option key={index} value={index + 1}>
                                                    {index + 1}
                                                </option>
                                            ))}
                                        </select> */}
                                  {/* <select required className="rounded p-1 mt-4" value={rest.cata} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setRest({ ...rest, cata: event.target.value })} >
                                            <option value="" disabled>Cata</option>
                                            {Array.from({ length: 80 }).map((_, index) => (
                                                <option key={index} value={index + 1}>
                                                    {index + 1}
                                                </option>
                                            ))}
                                        </select> */}
                                </div>
                            </div>
                            <hr/>
                          {/* Dados pagamento */}
                          {
                              !load_bank && has_pass &&
                              <div className="grid 2xl:grid-cols-3 gap-2">
                                {
                                    listBanks.length > 0 &&
                                    <div className="col-span-full xl:col-span-1 xl:col-start-2 w-full flex justify-end">
                                      {
                                        !insertbank ?
                                            <Button
                                                type="button"
                                                onClick={() => clearBank(true)}
                                            >
                                              Novo banco
                                            </Button> :
                                            <Button
                                                type="button"
                                                onClick={() => clearBank(false)}
                                            >
                                              Selecionar Banco
                                            </Button>
                                      }
                                    </div>
                                }
                                {
                                  listBanks.length > 0 && !insertbank ?
                                      <select
                                          required
                                          className="xl:col-start-2 rounded p-1 w-full"
                                          onChange={(event: React.ChangeEvent<HTMLSelectElement>) => selectBank(
                                              JSON.parse(event.target.value))}
                                      >
                                        <option
                                            value=""
                                            selected
                                            disabled
                                        >Selecionar Banco
                                        </option>
                                        {listBanks.map((temp_bank) => (
                                            <option
                                                key={temp_bank.id}
                                                value={JSON.stringify(
                                                    temp_bank)}
                                            >
                                              {temp_bank.banco}
                                            </option>
                                        ))}
                                      </select> :
                                      <>
                                        <div className="flex w-full max-2xl:flex-col 2xl:items-center 2xl:space-x-2">
                                          <div className="flex flex-col min-w-28">
                                            <label htmlFor="">Banco:</label>
                                            <sub>Nome do banco</sub>
                                          </div>
                                          <input
                                              required
                                              type="text"
                                              value={banco.banco}
                                              className="rounded flex-1 p-1 mt-3"
                                              onInput={(event: React.ChangeEvent<HTMLInputElement>) => setBanco(
                                                  {
                                                    ...banco,
                                                    banco: event.target.value,
                                                  })}
                                          />
                                        </div>
                                        <div className="flex w-full max-2xl:flex-col 2xl:items-center 2xl:space-x-2">
                                          <div className="flex flex-col min-w-28">
                                            <label htmlFor="">Nº Banco:</label>
                                            <sub>Número do banco</sub>
                                          </div>
                                          <input
                                              required
                                              type="text"
                                              value={banco.nb}
                                              className="rounded p-1 flex-1 mt-3"
                                              onInput={(event: React.ChangeEvent<HTMLInputElement>) => setBanco(
                                                  {
                                                    ...banco,
                                                    nb: event.target.value,
                                                  })}
                                          />
                                        </div>
                                        <div className="flex w-full max-2xl:flex-col 2xl:items-center 2xl:space-x-2">
                                          <div className="flex flex-col min-w-28">
                                            <label htmlFor="">Agência:</label>
                                            <sub>Número da agência</sub>
                                          </div>
                                          <input
                                              required
                                              type="text"
                                              value={banco.ag}
                                              className="rounded p-1 flex-1 mt-3"
                                              onInput={(event: React.ChangeEvent<HTMLInputElement>) => setBanco(
                                                  {
                                                    ...banco,
                                                    ag: event.target.value,
                                                  })}
                                          />
                                        </div>
                                        <div className="flex w-full max-2xl:flex-col 2xl:items-center 2xl:space-x-2">
                                          <div className="flex flex-col min-w-28">
                                            <label htmlFor="">Conta:</label>
                                            <sub>Número da conta</sub>
                                          </div>
                                          <input
                                              required
                                              type="text"
                                              value={banco.cc}
                                              className="rounded p-1 flex-1 mt-3"
                                              onInput={(event: React.ChangeEvent<HTMLInputElement>) => setBanco(
                                                  {
                                                    ...banco,
                                                    cc: event.target.value,
                                                  })}
                                          />
                                        </div>
                                      </>
                                }
                              </div>
                          }
                        </div>
                        <div className="w-full flex items-center space-x-2 justify-center">
                          {/* <Button type="button" onClick={() => sendWpp()} disabled={loader} className="max-xl:w-full flex items-center justify-center p-2 px-4 disabled:scale-100 disabled:cursor-not-allowed bg-[#5A3C24] text-white rounded text-sm active:scale-95 transition-all">
                                    {
                                        !loader ? 'Ofertar' : <Loader2 className="animate-spin" />
                                    }
                                </Button> */}
                          {
                            has_pass ?
                                <Button
                                    type="submit"
                                    disabled={loader}
                                    className="max-xl:w-full flex my-2 items-center justify-center p-2 px-4 disabled:scale-100 disabled:cursor-not-allowed bg-[#5A3C24] text-white rounded text-sm active:scale-95 transition-all"
                                >
                                  {
                                    !loader ? 'Salvar PDF' :
                                        <Loader2 className="animate-spin"/>
                                  }
                                </Button> :
                                <Button
                                    type="button"
                                    onClick={() => sendWpp()}
                                    disabled={loader}
                                    className="max-xl:w-full flex items-center justify-center p-2 px-4 disabled:scale-100 disabled:cursor-not-allowed bg-[#5A3C24] text-white rounded text-sm active:scale-95 transition-all"
                                >
                                  {
                                    !loader ? 'Ofertar' :
                                        <Loader2 className="animate-spin"/>
                                  }
                                </Button>
                          }
                        </div>
                      {
                          has_pass &&
                          <div className="w-full">
                              <Button
                                  type="button"
                                  onClick={() => sendWpp()}
                                  disabled={loader}
                                  className="max-xl:w-full flex items-center justify-center p-2 px-4 disabled:scale-100 disabled:cursor-not-allowed bg-[#5A3C24] text-white rounded text-sm active:scale-95 transition-all"
                              >
                                {
                                  !loader ? 'Ofertar' :
                                      <Loader2 className="animate-spin"/>
                                }
                              </Button>
                          </div>
                      }
                    </form>
                </main>
                <div className="w-full flex items-center justify-end">
                    <img
                        className="h-20 mr-2 mt-2"
                        src="/newlogo.png"
                        alt="logo"
                    />
                </div>
            </div>
        }
        {
            haspdf && <PdfPage
                broker={broker}
                date_payment={configs.date_payment}
                banco={banco}
                day={day}
                local={local}
                rest={rest}
                seller={seller}
                pass_user={has_pass}
            />
        }
        <Dialog open={showModalPass}>
          <DialogContent>
            <DialogHeader className="flex items-start relative">
              <DialogTitle>
                Senha Corretora
              </DialogTitle>
              <div
                  onClick={() => setShowModalPass(false)}
                  className="absolute right-0 -top-4"
              >
                <X/>
              </div>
            </DialogHeader>
            <div className="w-full flex flex-col items-center justify-center">
              <div className="flex flex-col items-start">
                <label
                    htmlFor="senha"
                    className="font-semibold text-sm"
                >Senha: </label>
                <input
                    type="password"
                    value={password}
                    className="border rounded p-1"
                    onInput={(event: React.ChangeEvent<HTMLInputElement>) => setPassword(
                        event.target.value)}
                />
              </div>
              <Button
                  onClick={() => checkPassword()}
                  disabled={loader}
                  className="mt-2 min-w-20"
              >
                {
                  !loader ? 'Ofertar' : <Loader2 className="animate-spin"/>
                }
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
  );
};