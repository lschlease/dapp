
// 地址的简写形式
export const  shortenAddress = (address:string)=>{
    return `${address.slice(0, 5)}...${address.slice(address.length - 4)}`
}
