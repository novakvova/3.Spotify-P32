import React from 'react';
import { Link } from 'react-router-dom';
import { FAQ } from '../components/FAQ';
import heroCollages from '../assets/home/hero-collages.png';
import sonoraCircleLogo from '../assets/home/sonoraCircleLogo.png';
import { Header } from "../components/Header.tsx";
import {Footer} from "../components/Footer.tsx";

// SVG Іконка мінуса (dash)
const DashIcon: React.FC = () => (
    <svg width="35" height="4" viewBox="0 0 35 4" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="35" height="4" fill="#280A3A"/>
    </svg>
);

// SVG Іконка галочки (check circle)
const CheckIcon: React.FC = () => (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
        <rect width="30" height="30" rx="15" fill="#6829C6"/>
        <use xlinkHref="#stroke0_168_490" fill="white"/>
        <defs>
            <path id="stroke0_168_490" d="M22.1611 9.3659C22.2598 9.25143 22.3778 9.16012 22.5083 9.09731C22.6388 9.03449 22.7791 9.00143 22.9212 9.00005C23.0632 8.99866 23.204 9.02899 23.3355 9.08925C23.4669 9.14952 23.5863 9.23851 23.6867 9.35105C23.7872 9.46358 23.8666 9.5974 23.9204 9.7447C23.9741 9.892 24.0012 10.0498 24 10.209C23.9987 10.3681 23.9692 10.5254 23.9132 10.6716C23.8571 10.8178 23.7756 10.9501 23.6735 11.0607L15.1171 20.6491C14.9165 20.8738 14.6445 21 14.3609 21C14.0773 21 13.8053 20.8738 13.6047 20.6491L9.32652 15.8549C9.22437 15.7443 9.14289 15.6121 9.08683 15.4658C9.03078 15.3196 9.00127 15.1623 9.00004 15.0032C8.99881 14.844 9.02587 14.6862 9.07965 14.5389C9.13342 14.3916 9.21284 14.2578 9.31326 14.1453C9.41369 14.0327 9.5331 13.9437 9.66455 13.8835C9.79599 13.8232 9.93683 13.7929 10.0788 13.7943C10.2209 13.7956 10.3612 13.8287 10.4917 13.8915C10.6222 13.9543 10.7402 14.0456 10.8389 14.1601L14.3609 18.1069L22.1611 9.3659Z"/>
        </defs>
    </svg>
);

// SVG Іконка типів оплат
const PaymentMethodsIcon: React.FC = () => (
    <svg width="290" height="35" viewBox="0 0 290 35" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M40.8081 15.5707C40.8081 15.5707 41.4675 18.4773 41.6159 19.0862H38.7175L40.1066 15.6874C40.0894 15.7113 40.3925 14.9759 40.5659 14.5231L40.8081 15.5707ZM50 3.7503V31.2497C49.9988 32.244 49.5593 33.1973 48.7781 33.9003C47.9969 34.6034 46.9377 34.9989 45.8329 35H4.16706C3.06227 34.9989 2.00308 34.6034 1.22187 33.9003C0.440667 33.1973 0.00124064 32.244 0 31.2497V3.7503C0.00124064 2.756 0.440667 1.80275 1.22187 1.09967C2.00308 0.396595 3.06227 0.00111656 4.16706 0H45.8329C46.9377 0.00111656 47.9969 0.396595 48.7781 1.09967C49.5593 1.80275 49.9988 2.756 50 3.7503ZM13.2387 23.375L18.7244 11.2509H15.0355L11.6246 19.5319L11.2512 17.853L10.0356 12.2746C9.83563 11.5012 9.22002 11.2818 8.45599 11.2509H2.84054L2.7796 11.4928C4.0655 11.777 5.29903 12.227 6.44199 12.8286L9.5497 23.375H13.2387ZM21.4337 23.3905L23.6211 11.2509H20.1322L17.9541 23.3905H21.4337ZM33.5771 19.4223C33.5943 18.04 32.6568 16.9853 30.6522 16.1177C29.4288 15.5623 28.6819 15.1882 28.6819 14.6173C28.6991 14.1012 29.3163 13.5697 30.6865 13.5697C31.5792 13.5458 32.4662 13.7035 33.2818 14.0309L33.5943 14.1631L34.0724 11.5378C33.0745 11.1956 32.0154 11.0207 30.9475 11.0217C27.5007 11.0217 25.0789 12.6782 25.0617 15.0364C25.0352 16.7786 26.7976 17.7475 28.1179 18.3325C29.4631 18.9259 29.9241 19.3168 29.9241 19.8399C29.9069 20.6527 28.8303 21.0267 27.8319 21.0267C26.4429 21.0267 25.6961 20.8313 24.5586 20.3785L24.0992 20.183L23.6133 22.9096C24.4289 23.2457 25.9398 23.5424 27.5023 23.5579C31.1647 23.5649 33.5521 21.9323 33.5786 19.418L33.5771 19.4223ZM45.8329 23.3905L43.0205 11.2509H40.3206C39.4878 11.2509 38.8535 11.4703 38.4972 12.2591L33.3146 23.3919H36.977C36.977 23.3919 37.5754 21.8915 37.7066 21.5723H42.1862C42.2909 22.0026 42.6034 23.3919 42.6034 23.3919L45.8329 23.3905Z" fill="black"/>
        <path d="M83.6335 30.2018L84.007 30.4946C81.4761 32.1365 78.4988 33.0088 75.4552 32.9999C66.9174 32.9999 60 26.2913 60 18C60 9.71628 66.9174 3.00007 75.4458 3.00007C78.6131 3.00007 81.5585 3.91661 84.0007 5.49627C83.8809 5.59382 83.7662 5.69714 83.657 5.80583C80.0053 8.87106 77.9052 13.3217 77.9052 18C77.9052 22.6783 79.9975 27.1289 83.6351 30.2018H83.6335ZM94.5558 3.00007C91.5124 2.99071 88.5348 3.85952 86.0008 5.49627C86.1243 5.59946 86.2461 5.70264 86.3446 5.80583C88.148 7.31872 89.595 9.19076 90.5874 11.2948C91.5799 13.3989 92.0945 15.6857 92.0963 18C92.0963 22.6722 90.0041 27.1214 86.3664 30.2018L85.993 30.4946C88.5239 32.1365 91.5012 33.0088 94.5448 32.9999C103.083 32.9999 110 26.2913 110 18C110 9.71628 103.084 3.00007 94.5558 3.00007ZM85.0008 6.21706C83.1611 7.6179 81.6738 9.40694 80.6516 11.4487C79.6294 13.4904 79.099 15.7312 79.1006 18.0015C79.0978 20.2731 79.6276 22.5154 80.6499 24.5586C81.6722 26.6017 83.1601 28.3919 85.0008 29.7936C85.2055 29.6433 85.393 29.4855 85.5867 29.3201C87.2567 27.9141 88.5956 26.1756 89.5125 24.2226C90.4295 22.2696 90.903 20.1479 90.901 18.0015C90.9026 15.7312 90.3722 13.4904 89.3499 11.4487C88.3277 9.40694 86.8404 7.6179 85.0008 6.21706Z" fill="black"/>
        <path d="M129.134 10.5787C128.547 11.253 127.61 11.7874 126.676 11.7092C126.553 10.7999 127.018 9.82598 127.556 9.22234C128.142 8.5344 129.167 8.04064 129.998 8C130.097 8.94987 129.711 9.88319 129.134 10.5787ZM129.989 11.8883C128.631 11.8085 127.465 12.6395 126.821 12.6395C126.163 12.6395 125.177 11.9274 124.104 11.9515C122.711 11.9681 121.41 12.7343 120.702 13.9672C119.228 16.4194 120.319 20.0503 121.735 22.0494C122.427 23.0369 123.255 24.1192 124.348 24.0891C125.381 24.0485 125.796 23.4313 127.042 23.4313C128.303 23.4313 128.661 24.0891 129.761 24.065C130.891 24.0485 131.606 23.0775 132.299 22.09C133.088 20.9685 133.413 19.8696 133.43 19.8154C133.413 19.7914 131.241 18.9845 131.225 16.5534C131.208 14.5136 132.933 13.5427 133.006 13.487C132.038 12.0765 130.508 11.9274 129.987 11.8898L129.989 11.8883ZM137.827 9.1275V23.9627H140.195V18.8912H143.469C146.455 18.8912 148.555 16.8921 148.555 14.0063C148.555 11.1146 146.497 9.12901 143.55 9.12901L137.827 9.1275ZM140.195 11.0724H142.922C144.972 11.0724 146.146 12.1382 146.146 14.0123C146.146 15.8865 144.972 16.9613 142.906 16.9613H140.195V11.0724ZM152.867 24.0726C154.356 24.0726 155.731 23.344 156.359 22.1818H156.409V23.9627H158.597V16.5759C158.597 14.4444 156.841 13.058 154.129 13.058C151.623 13.058 149.766 14.4609 149.702 16.3818H151.826C152.006 15.465 152.868 14.8689 154.065 14.8689C155.514 14.8689 156.32 15.5267 156.32 16.7355V17.5499L153.375 17.723C150.623 17.8871 149.141 18.977 149.141 20.8827C149.141 22.8036 150.673 24.0741 152.868 24.0741L152.867 24.0726ZM153.51 22.3158C152.248 22.3158 151.443 21.7272 151.443 20.827C151.443 19.8937 152.217 19.3443 153.689 19.257L156.319 19.1004V19.9389C156.319 21.3283 155.106 22.3158 153.501 22.3158H153.51ZM161.519 28C163.821 28 164.906 27.1374 165.849 24.5422L170 13.2055H167.6L164.817 21.9621H164.767L161.983 13.2055H159.51L163.515 24.0018L163.302 24.6596C162.935 25.7661 162.351 26.1951 161.308 26.1951C161.121 26.1951 160.763 26.1725 160.616 26.1575V27.9383C160.754 27.9759 161.341 27.9925 161.511 27.9925L161.519 28Z" fill="black"/>
        <path d="M188.257 7.50061C186.726 7.5 185.226 7.92831 183.923 8.73765C182.62 9.54698 181.566 10.7054 180.88 12.0834C180.301 13.2419 180 14.5207 180 15.8174C180 17.1142 180.301 18.393 180.88 19.5514C181.566 20.9294 182.62 22.0879 183.923 22.8972C185.226 23.7065 186.726 24.1349 188.257 24.1342C190.486 24.1342 192.361 23.3956 193.73 22.1261C195.288 20.6783 196.188 18.5379 196.188 16.0073C196.185 15.4405 196.136 14.8749 196.042 14.3161H188.259V17.5181H192.717C192.626 18.0295 192.433 18.5169 192.15 18.9514C191.867 19.3859 191.501 19.7584 191.071 20.0467C190.33 20.5524 189.376 20.8419 188.259 20.8419C186.105 20.8419 184.278 19.3794 183.624 17.409C183.279 16.3764 183.279 15.2585 183.624 14.2258C184.278 12.2534 186.105 10.7929 188.259 10.7929C189.436 10.7731 190.574 11.2208 191.426 12.0393L193.784 9.66821C192.291 8.25208 190.308 7.47499 188.257 7.50061ZM201.8 8.65471V23.1333H203.646V17.2684H206.698C207.954 17.2684 209.011 16.8572 209.869 16.0346C210.296 15.6489 210.636 15.1747 210.864 14.6444C211.093 14.1142 211.204 13.5405 211.192 12.9626C211.201 12.3878 211.087 11.8177 210.859 11.2908C210.631 10.7638 210.293 10.2921 209.869 9.90742C209.449 9.49819 208.952 9.17666 208.408 8.96132C207.864 8.74598 207.283 8.64107 206.698 8.65261L201.8 8.65471ZM206.857 10.4383C207.179 10.4444 207.496 10.5154 207.791 10.6469C208.085 10.7784 208.35 10.9679 208.571 11.2042C208.806 11.4342 208.992 11.7092 209.12 12.013C209.247 12.3168 209.313 12.6433 209.313 12.9731C209.313 13.3029 209.247 13.6294 209.12 13.9332C208.992 14.237 208.806 14.5121 208.571 14.742C208.335 14.9882 208.051 15.1821 207.736 15.3111C207.422 15.4401 207.084 15.5014 206.744 15.4911H203.646V10.4383H206.857ZM215.448 12.9039C213.695 12.9039 212.371 13.5509 211.475 14.8448L213.102 15.8751C213.702 14.9994 214.518 14.5616 215.55 14.5616C216.208 14.5524 216.845 14.7945 217.334 15.2393C217.575 15.4388 217.769 15.6903 217.901 15.9755C218.033 16.2606 218.1 16.572 218.096 16.8865V17.3104C217.388 16.9047 216.485 16.7026 215.388 16.704C214.102 16.704 213.075 17.0075 212.307 17.6147C211.536 18.219 211.151 19.0339 211.152 20.0592C211.145 20.52 211.239 20.9767 211.428 21.3962C211.617 21.8158 211.897 22.1877 212.246 22.4849C212.975 23.1326 213.881 23.4565 214.965 23.4565C216.236 23.4565 217.253 22.8899 218.017 21.7568H218.096V23.1312H219.863V17.0271C219.863 15.7471 219.468 14.7399 218.679 14.0055C217.888 13.2711 216.811 12.9039 215.448 12.9039ZM220.163 13.227L224.217 22.5059L221.929 27.5H223.836L230 13.2249H227.99L225.14 20.3404H225.098L222.169 13.227H220.163ZM215.692 18.1959C216.721 18.1959 217.524 18.4267 218.1 18.8884C218.1 19.669 217.795 20.3495 217.184 20.9301C216.912 21.2061 216.588 21.4251 216.231 21.5742C215.875 21.7233 215.493 21.7996 215.106 21.7988C214.586 21.8089 214.078 21.6369 213.669 21.312C213.479 21.1731 213.325 20.9907 213.218 20.7798C213.112 20.5689 213.057 20.3356 213.059 20.0991C213.059 19.5633 213.311 19.1108 213.815 18.7415C214.315 18.3778 214.942 18.1959 215.692 18.1959Z" fill="black"/>
        <path d="M256.172 17.6719C256.172 18.625 255.33 19.3516 254.262 19.3516C253.464 19.3516 252.873 18.9453 252.873 18.1797C252.873 17.2266 253.698 16.4609 254.757 16.4609C255.564 16.4609 256.172 16.9062 256.172 17.6719ZM246.988 13.8828H246.58C246.45 13.8828 246.319 13.9609 246.302 14.0938L245.929 16.1797L246.641 16.1562C247.595 16.1562 248.333 16.0391 248.507 15.0469C248.707 14 247.969 13.8828 246.988 13.8828ZM271.641 13.8828H271.25C271.094 13.8828 270.99 13.9609 270.972 14.0938L270.608 16.1797L271.302 16.1562C272.431 16.1562 273.212 15.9219 273.212 14.75C273.203 13.9219 272.378 13.8828 271.641 13.8828ZM290 3.75V31.25C290 33.3203 288.134 35 285.833 35H244.167C241.866 35 240 33.3203 240 31.25V3.75C240 1.67969 241.866 0 244.167 0H285.833C288.134 0 290 1.67969 290 3.75ZM251.137 14.3281C251.137 12.6875 249.731 12.1406 248.125 12.1406H244.653C244.436 12.1406 244.219 12.2969 244.201 12.5078L242.778 20.4844C242.752 20.6406 242.882 20.7969 243.056 20.7969H244.705C244.939 20.7969 245.156 20.5703 245.182 20.3516L245.573 18.2734C245.66 17.7109 246.719 17.9062 247.135 17.9062C249.618 17.9062 251.137 16.5781 251.137 14.3281ZM258.446 15.0156H256.797C256.467 15.0156 256.45 15.4453 256.432 15.6562C255.929 14.9922 255.2 14.875 254.375 14.875C252.248 14.875 250.625 16.5547 250.625 18.4062C250.625 19.9297 251.684 20.9219 253.377 20.9219C254.158 20.9219 255.13 20.5391 255.677 19.9922C255.634 20.1094 255.59 20.3594 255.59 20.4766C255.59 20.6562 255.677 20.7891 255.868 20.7891H257.361C257.595 20.7891 257.795 20.5625 257.839 20.3438L258.724 15.3203C258.75 15.1719 258.62 15.0156 258.446 15.0156ZM261.962 22.6641L267.491 15.4297C267.535 15.3906 267.535 15.3516 267.535 15.2969C267.535 15.1641 267.405 15.0234 267.257 15.0234H265.59C265.443 15.0234 265.286 15.1016 265.2 15.2188L262.899 18.2656L261.944 15.3359C261.875 15.1641 261.684 15.0234 261.467 15.0234H259.844C259.696 15.0234 259.566 15.1641 259.566 15.2969C259.566 15.3906 261.259 19.7344 261.406 20.1484C261.172 20.4453 259.627 22.3828 259.627 22.6172C259.627 22.7578 259.757 22.8672 259.905 22.8672H261.571C261.727 22.8594 261.875 22.7812 261.962 22.6641ZM275.79 14.3281C275.79 12.6875 274.384 12.1406 272.778 12.1406H269.332C269.097 12.1406 268.88 12.2969 268.854 12.5078L267.448 20.4766C267.431 20.6328 267.561 20.7891 267.726 20.7891H269.505C269.679 20.7891 269.809 20.6719 269.852 20.5391L270.243 18.2734C270.33 17.7109 271.389 17.9062 271.806 17.9062C274.271 17.9062 275.79 16.5781 275.79 14.3281ZM283.099 15.0156H281.45C281.12 15.0156 281.102 15.4453 281.076 15.6562C280.599 14.9922 279.861 14.875 279.019 14.875C276.892 14.875 275.269 16.5547 275.269 18.4062C275.269 19.9297 276.328 20.9219 278.021 20.9219C278.828 20.9219 279.8 20.5391 280.321 19.9922C280.295 20.1094 280.234 20.3594 280.234 20.4766C280.234 20.6562 280.321 20.7891 280.512 20.7891H282.014C282.248 20.7891 282.448 20.5625 282.491 20.3438L283.377 15.3203C283.403 15.1719 283.273 15.0156 283.099 15.0156ZM287.222 12.4141C287.222 12.2578 287.092 12.1406 286.944 12.1406H285.339C285.208 12.1406 285.078 12.2344 285.061 12.3516L283.655 20.4766L283.628 20.5156C283.628 20.6562 283.759 20.7891 283.932 20.7891H285.365C285.582 20.7891 285.799 20.5625 285.816 20.3438L287.222 12.4375V12.4141ZM279.41 16.4609C278.351 16.4609 277.526 17.2188 277.526 18.1797C277.526 18.9375 278.134 19.3516 278.932 19.3516C279.974 19.3516 280.816 18.6328 280.816 17.6719C280.825 16.9062 280.217 16.4609 279.41 16.4609Z" fill="black"/>
    </svg>
);

// SVG Бейдж "0 USD за 1 місяць"
const BadgeTag: React.FC<{ color: string }> = ({ color }) => (
    <div className="absolute top-0 left-0 z-10 pointer-events-none">
        <svg width="163" height="30" viewBox="0 0 163 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0H163V20C163 25.5228 158.523 30 153 30H0V0Z" fill={color}/>
            <text x="12" y="20" fill="white" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
                0 USD за 1 місяць
            </text>
        </svg>
    </div>
);

export const MainPage: React.FC = () => {
    const faqList = [
        { question: "Як працює пробна версія Sonora Premium?" },
        { question: "Як скасувати мою підписку Premium?" },
        { question: "Як працює підписка Premium Duo?" },
        { question: "Як працює підписка Premium Family?" },
        { question: "Як працює підписка Premium Student?" },
        { question: "Яка вартість Sonora Premium у вашому регіоні?" }
    ];

    return (
        <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
            {/* Header & Hero */}
            <div className="relative">
                <div
                    className="absolute top-0 left-0 right-0 pointer-events-none z-10"
                    style={{
                        height: '150px',
                        background: 'linear-gradient(180deg, #8A38F5 0%, #FFFFFF00 100%)'
                    }}
                />

                <div className="relative z-40">
                    <Header />
                </div>

                {/* Hero Section */}
                <section className="relative pt-12 pb-32 px-8 sm:px-12 lg:px-28 xl:px-40 overflow-hidden">
                    <div
                        className="hidden lg:block absolute pointer-events-none z-0"
                        style={{
                            width: '720px',
                            height: '950px',
                            top: '-110px',
                            right: '-20px',
                        }}
                    >
                        <img
                            src={heroCollages}
                            alt="Музичні альбоми"
                            className="w-full h-full object-contain object-right-top"
                            style={{ boxShadow: 'none', filter: 'none' }}
                        />
                    </div>

                    <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-start justify-between relative z-20">
                        <div className="max-w-[580px] space-y-6">
                            <h1
                                className="font-['Inter'] font-extrabold text-[#120826] tracking-tight"
                                style={{ fontSize: '40px', lineHeight: '55px' }}
                            >
                                Слухайте без обмежень. Спробуйте 1 місяць Premium Individual за 0 USD
                            </h1>
                            <p className="text-[#120826] text-base font-medium">
                                Потім усього 4,99 USD\ на місяць. Можна скасувати будь-коли
                            </p>

                            <div className="flex flex-row items-center gap-4 pt-2">
                                <button className="bg-[#120826] text-white font-bold py-3.5 px-7 rounded-full hover:bg-opacity-90 transition whitespace-nowrap cursor-pointer">
                                    Спробувати 1 місяць за 0 USD
                                </button>
                                <button className="border border-[#120826] text-[#120826] font-bold py-3.5 px-7 rounded-full hover:bg-black/5 transition whitespace-nowrap cursor-pointer">
                                    Переглянути всі підписки
                                </button>
                            </div>

                            <p className="text-xs text-gray-500 pt-1 leading-relaxed">
                                0 USD за 1 місяць, потім 4,99 USD на місяць. Пропозиція доступна, лише якщо ви раніше не користувалися Premium-підпискою
                            </p>
                        </div>
                    </div>
                </section>
            </div>

            {/* Comparison Section */}
            <section className="py-10 px-4 max-w-4xl mx-auto text-center relative z-20">
                <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-[#120826]">Відчуйте різницю</h2>

                <p className="text-[#120826] font-bold text-lg md:text-xl mb-12 leading-relaxed max-w-2xl mx-auto">
                    Перейдіть на <span className="text-[#6829C6]">Premium</span> і насолоджуйтеся повним контролем над<br className="hidden sm:inline" />
                    музикою. Можна скасувати будь-коли
                </p>

                <div className="max-w-[500px] mx-auto">
                    <div className="grid grid-cols-3 pb-4 text-left items-end">
                        <div className="font-bold text-[#120826] text-sm md:text-base">Ви отримаєте:</div>
                        <div className="text-center font-bold text-[#120826] text-xs md:text-sm leading-tight">
                            Підписка<br />Sonora Free
                        </div>
                        <div className="text-center font-bold text-[#6829C6] text-xs md:text-sm leading-tight">
                            Підписка<br />Sonora Premium
                        </div>
                    </div>

                    <div className="border-t-[3px] border-[#6B309B]">
                        <div className="grid grid-cols-3 py-4 text-left items-center border-b-[3px] border-[#6B309B]">
                            <div className="font-medium text-[#120826] text-xs md:text-sm">
                                Прослуховування<br />музики без реклами
                            </div>
                            <div className="flex justify-center"><DashIcon /></div>
                            <div className="flex justify-center"><CheckIcon /></div>
                        </div>

                        <div className="grid grid-cols-3 py-4 text-left items-center border-b-[3px] border-[#6B309B]">
                            <div className="font-medium text-[#120826] text-xs md:text-sm">
                                Завантажуйте, щоб<br />слухати офлайн
                            </div>
                            <div className="flex justify-center"><DashIcon /></div>
                            <div className="flex justify-center"><CheckIcon /></div>
                        </div>

                        <div className="grid grid-cols-3 py-4 text-left items-center border-b-[3px] border-[#6B309B]">
                            <div className="font-medium text-[#120826] text-xs md:text-sm">
                                Слухайте треки в<br />будь-якому порядку
                            </div>
                            <div className="flex justify-center"><DashIcon /></div>
                            <div className="flex justify-center"><CheckIcon /></div>
                        </div>

                        <div className="grid grid-cols-3 py-4 text-left items-center border-b-[3px] border-[#6B309B]">
                            <div className="font-medium text-[#120826] text-xs md:text-sm">Висока якість звуку</div>
                            <div className="flex justify-center"><DashIcon /></div>
                            <div className="flex justify-center"><CheckIcon /></div>
                        </div>

                        <div className="grid grid-cols-3 py-4 text-left items-center border-b-[3px] border-[#6B309B]">
                            <div className="font-medium text-[#120826] text-xs md:text-sm">
                                Прослуховування<br />разом із друзями<br />в реальному часі
                            </div>
                            <div className="flex justify-center"><DashIcon /></div>
                            <div className="flex justify-center"><CheckIcon /></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Subscription Cards Section */}
            <section className="py-20 bg-white px-4">
                <div className="max-w-6xl mx-auto text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-extrabold mb-3 text-[#120826]">Доступні підписки на будь-який випадок</h2>

                    <p className="text-[#120826] font-bold max-w-2xl mx-auto mb-6 text-sm md:text-base leading-snug">
                        Виберіть <span className="text-[#6829C6]">Premium</span>-підписку й слухайте музику без реклами й обмежень на телефоні, колонці чи інших пристроях. Оплачуйте зручним для вас способом. Можна скасувати будь-коли
                    </p>

                    <div className="flex justify-center mb-16">
                        <PaymentMethodsIcon />
                    </div>
                </div>

                {/* First Row: 3 Cards (вужчі за шириною - max-w-5xl) */}
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-stretch">

                    {/* Card 1: Individual */}
                    <div className="relative bg-white border-[4px] border-[#CD51CA] rounded-3xl p-7 pt-12 shadow-sm flex flex-col justify-between overflow-hidden">
                        <BadgeTag color="#CD51CA" />

                        <div>
                            {/* Logo + Larger Premium Text */}
                            <div className="flex items-center gap-2 mb-3">
                                <img src={sonoraCircleLogo} alt="Sonora" className="w-6 h-6 object-contain" />
                                <span className="font-extrabold text-[#CD51CA] text-base">Premium</span>
                            </div>

                            {/* Заголовок шрифтом Inter */}
                            <h3 className="font-['Inter'] text-4xl font-extrabold text-[#CD51CA] tracking-tight mb-2">Individual</h3>

                            <p className="font-bold text-[#CD51CA] text-base mb-0.5">0 USD за 1 місяць</p>
                            <p className="text-xs text-gray-500 mb-5">Потім 4,99 USD на місяць</p>

                            {/* Розділювальна смужка від краю до краю, товста (#CD51CA) */}
                            <div className="-mx-7 border-t-[3px] border-[#CD51CA] mb-6 opacity-90" />

                            {/* Список переваг кольору картки (#CD51CA) */}
                            <ul className="text-xs space-y-3.5 text-left font-semibold text-[#CD51CA] mb-8">
                                <li className="flex items-start gap-2"><span>•</span> 1 акаунт Premium</li>
                                <li className="flex items-start gap-2"><span>•</span> Можна скасувати будь-коли</li>
                            </ul>
                        </div>

                        <button className="w-full bg-[#CD51CA] text-white font-bold py-3 rounded-full hover:opacity-90 transition text-sm">
                            Спробувати 1 місяць за 0 USD
                        </button>
                    </div>

                    {/* Card 2: Duo */}
                    <div className="relative bg-white border-[4px] border-[#6B309B] rounded-3xl p-7 pt-12 shadow-sm flex flex-col justify-between overflow-hidden">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <img src={sonoraCircleLogo} alt="Sonora" className="w-6 h-6 object-contain" />
                                <span className="font-extrabold text-[#6B309B] text-base">Premium</span>
                            </div>

                            <h3 className="font-['Inter'] text-4xl font-extrabold text-[#6B309B] tracking-tight mb-2">Duo</h3>

                            <p className="font-bold text-[#6B309B] text-base mb-0.5">6,49 USD на місяць</p>
                            <p className="text-xs text-gray-500 mb-5 leading-tight">Для двох користувачів, які проживають за однією адресою</p>

                            <div className="-mx-7 border-t-[3px] border-[#6B309B] mb-6 opacity-90" />

                            <ul className="text-xs space-y-3.5 text-left font-semibold text-[#6B309B] mb-8">
                                <li className="flex items-start gap-2"><span>•</span> 2 акаунти Premium</li>
                                <li className="flex items-start gap-2"><span>•</span> Можна скасувати будь-коли</li>
                            </ul>
                        </div>

                        <Link
                            to="/premium/duo"
                            className="w-full bg-[#6B309B] text-white font-bold py-3 rounded-full hover:opacity-90 transition text-center text-sm block"
                        >
                            Отримати Premium Duo
                        </Link>
                    </div>

                    {/* Card 3: Family */}
                    <div className="relative bg-white border-[4px] border-[#E869CA] rounded-3xl p-7 pt-12 shadow-sm flex flex-col justify-between overflow-hidden">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <img src={sonoraCircleLogo} alt="Sonora" className="w-6 h-6 object-contain" />
                                <span className="font-extrabold text-[#E869CA] text-base">Premium</span>
                            </div>

                            <h3 className="font-['Inter'] text-4xl font-extrabold text-[#E869CA] tracking-tight mb-2">Family</h3>

                            <p className="font-bold text-[#E869CA] text-base mb-0.5">7,99 USD на місяць</p>
                            <p className="text-xs text-gray-500 mb-5 leading-tight">Для 6 членів сім’ї, які проживають за однією адресою.</p>

                            <div className="-mx-7 border-t-[3px] border-[#E869CA] mb-6 opacity-90" />

                            <ul className="text-xs space-y-3.5 text-left font-semibold text-[#E869CA] mb-8">
                                <li className="flex items-start gap-2"><span>•</span> До 6 акаунтів Premium</li>
                                <li className="flex items-start gap-2"><span>•</span> Можна скасувати будь-коли</li>
                            </ul>
                        </div>

                        <Link
                            to="/premium/family"
                            className="w-full bg-[#E869CA] text-white font-bold py-3 rounded-full hover:opacity-90 transition text-center text-sm block"
                        >
                            Отримати Premium Family
                        </Link>
                    </div>

                </div>

                {/* Second Row: 2 Cards (вужчий блок - max-w-[660px]) */}
                <div className="max-w-[660px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">

                    {/* Card 4: Student */}
                    <div className="relative bg-white border-[4px] border-[#6829C6] rounded-3xl p-7 pt-12 shadow-sm flex flex-col justify-between overflow-hidden">
                        <BadgeTag color="#6829C6" />

                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <img src={sonoraCircleLogo} alt="Sonora" className="w-6 h-6 object-contain" />
                                <span className="font-extrabold text-[#6829C6] text-base">Premium</span>
                            </div>

                            <h3 className="font-['Inter'] text-4xl font-extrabold text-[#6829C6] tracking-tight mb-2">Student</h3>

                            <p className="font-bold text-[#6829C6] text-base mb-0.5">0 USD за 1 місяць</p>
                            <p className="text-xs text-gray-500 mb-5">Потім 2,49 USD на місяць</p>

                            <div className="-mx-7 border-t-[3px] border-[#6829C6] mb-6 opacity-90" />

                            <ul className="text-xs space-y-3.5 text-left font-semibold text-[#6829C6] mb-8">
                                <li className="flex items-start gap-2"><span>•</span> 1 підтверджений акаунт Premium</li>
                                <li className="flex items-start gap-2"><span>•</span> Можна скасувати будь-коли</li>
                            </ul>
                        </div>

                        <Link
                            to="/premium/student"
                            className="w-full bg-[#6829C6] text-white font-bold py-3 rounded-full hover:opacity-90 transition text-center text-sm block"
                        >
                            Спробувати 1 місяць за 0 USD
                        </Link>
                    </div>

                    {/* Card 5: Kids+ */}
                    <div className="relative bg-white border-[4px] border-[#AA71FF] rounded-3xl p-7 pt-12 shadow-sm flex flex-col justify-between overflow-hidden">
                        <BadgeTag color="#AA71FF" />

                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <img src={sonoraCircleLogo} alt="Sonora" className="w-6 h-6 object-contain" />
                                <span className="font-extrabold text-[#AA71FF] text-base">Premium</span>
                            </div>

                            <h3 className="font-['Inter'] text-4xl font-extrabold text-[#AA71FF] tracking-tight mb-2">Kids+</h3>

                            <p className="font-bold text-[#AA71FF] text-base mb-0.5">0 USD за 1 місяць</p>
                            <p className="text-xs text-gray-500 mb-5">Потім 0,99 USD на місяць</p>

                            <div className="-mx-7 border-t-[3px] border-[#AA71FF] mb-6 opacity-90" />

                            <ul className="text-xs space-y-3.5 text-left font-semibold text-[#AA71FF] mb-8">
                                <li className="flex items-start gap-2"><span>•</span> Доступ до українських казок</li>
                                <li className="flex items-start gap-2"><span>•</span> Безпечний контент</li>
                                <li className="flex items-start gap-2"><span>•</span> Батьківський контроль</li>
                            </ul>
                        </div>

                        <Link
                            to="/premium/kids"
                            className="w-full bg-[#AA71FF] text-white font-bold py-3 rounded-full hover:opacity-90 transition text-center text-sm block"
                        >
                            Спробувати 1 місяць за 0 USD
                        </Link>
                    </div>

                </div>
            </section>

            <FAQ items={faqList} />
            <Footer/>
        </div>
    );
};
