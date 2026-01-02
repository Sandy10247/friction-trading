
/**
 * {"user_id":"QU4872","user_name":"Sandilya Phani Kumar Karavadi","user_shortname":"Sandilya","avatar_url":"https://s3.ap-south-1.amazonaws.com/zerodha-kite-blobs/avatars/vipntlQtkjvacvK2Hamp3AAFr30dIUbK.png","user_type":"individual/ind_with_nom","email":"sandilyakaravadi@gmail.com","broker":"ZERODHA","meta":{"demat_consent":"consent"},"products":["CNC","NRML","MIS","BO","CO"],"order_types":["MARKET","LIMIT","SL","SL-M"],"exchanges":["BCD","NFO","BFO","MCX","NSE","NCO","MF","BSE"]}
 */
export interface UserProfile {
    user_id: string
    user_name: string
    user_shortname: string
    avatar_url: string
    user_type: string
    email: string
    broker: string
    meta: {
        demat_consent: string
    }
    products: string[]
    order_types: string[]
    exchanges: string[]
}

export interface UserState {
    isLoggedIn: boolean
    profile: UserProfile | null
}

export interface RootState {
    user: UserState
}