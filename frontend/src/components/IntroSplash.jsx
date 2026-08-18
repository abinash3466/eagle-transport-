import React, {
    useEffect,
} from "react";

import logo from "../assets/eagle-logo.png";


const IntroSplash = ({
    onFinish,
}) => {


    /* =========================================
       AUTO CLOSE
    ========================================= */

    useEffect(() => {

        const timer =
            setTimeout(() => {

                if (onFinish) {
                    onFinish();
                }

            }, 4500);


        return () =>
            clearTimeout(timer);

    }, [onFinish]);


    const eagleLetters =
        "EAGLE".split("");


    const transportLetters =
        "TRANSPORT".split("");


    return (

        <div className="eagle-premium-intro">


            {/* =========================================
          BACKGROUND
      ========================================= */}

            <div className="eagle-intro-grid" />

            <div className="eagle-intro-glow eagle-intro-glow-left" />

            <div className="eagle-intro-glow eagle-intro-glow-right" />


            {/* =========================================
          PARTICLES
      ========================================= */}

            <div className="eagle-intro-particles">

                <span />
                <span />
                <span />
                <span />
                <span />
                <span />

            </div>


            {/* =========================================
          MAIN CONTENT
      ========================================= */}

            <div className="eagle-premium-intro-content">


                {/* =====================================
            BIG LOGO
        ===================================== */}

                <div className="eagle-premium-logo-stage">


                    <div className="eagle-logo-ring eagle-logo-ring-one" />

                    <div className="eagle-logo-ring eagle-logo-ring-two" />

                    <div className="eagle-logo-ring eagle-logo-ring-three" />


                    <span className="eagle-logo-dot eagle-logo-dot-one" />

                    <span className="eagle-logo-dot eagle-logo-dot-two" />


                    <div className="eagle-logo-big-shell">

                        <div className="eagle-logo-light-sweep" />

                        <img
                            src={logo}
                            alt="Eagle Transport"
                            className="eagle-premium-big-logo"
                        />

                    </div>

                </div>



                {/* =====================================
            EAGLE LETTERS
        ===================================== */}

                <div className="eagle-premium-brand">


                    <div className="eagle-premium-eagle-text">

                        {eagleLetters.map(
                            (letter, index) => (

                                <span
                                    key={index}
                                    style={{
                                        "--delay":
                                            `${1.05 + index * 0.09}s`,
                                    }}
                                >

                                    {letter}

                                </span>

                            )
                        )}

                    </div>


                    {/* TRANSPORT */}

                    <div className="eagle-premium-transport-text">

                        {transportLetters.map(
                            (letter, index) => (

                                <span
                                    key={index}
                                    style={{
                                        "--delay":
                                            `${1.55 + index * 0.055}s`,
                                    }}
                                >

                                    {letter}

                                </span>

                            )
                        )}

                    </div>

                </div>



                {/* =====================================
            DIALOGUE
        ===================================== */}

                <div className="eagle-premium-dialogue">

                    <span className="eagle-dialogue-line-left" />

                    <p>
                        Reliable Roads. Trusted Deliveries.
                    </p>

                    <span className="eagle-dialogue-line-right" />

                </div>



                {/* =====================================
            STATUS
        ===================================== */}

                <div className="eagle-premium-status">

                    <span className="eagle-status-dot" />

                    READY TO MOVE

                </div>



                {/* =====================================
            LOADING
        ===================================== */}

                <div className="eagle-premium-loader">

                    <div className="eagle-premium-loader-track">

                        <span />

                    </div>

                </div>


            </div>



            {/* =========================================
          STYLE
      ========================================= */}

            <style>{`

        /* =====================================================
           MAIN SCREEN
        ===================================================== */

        .eagle-premium-intro {

          position: fixed;

          inset: 0;

          z-index: 999999;


          display: flex;

          align-items: center;

          justify-content: center;


          overflow: hidden;


          padding: 20px;


          background:

            radial-gradient(
              circle at 50% 32%,
              rgba(20, 94, 175, .22),
              transparent 31%
            ),

            radial-gradient(
              circle at 80% 74%,
              rgba(255, 122, 0, .08),
              transparent 22%
            ),

            linear-gradient(
              145deg,
              #010812 0%,
              #06192d 46%,
              #03111f 72%,
              #010710 100%
            );


          animation:

            eagleIntroScreenZoom
            4.5s
            ease
            forwards;

        }



        /* =====================================================
           GRID
        ===================================================== */

        .eagle-intro-grid {

          position: absolute;

          inset: 0;


          opacity: .26;


          background-image:

            linear-gradient(
              rgba(255,255,255,.026) 1px,
              transparent 1px
            ),

            linear-gradient(
              90deg,
              rgba(255,255,255,.026) 1px,
              transparent 1px
            );


          background-size:

            48px 48px;


          animation:

            eagleGridMove
            12s
            linear
            infinite;

        }



        /* =====================================================
           GLOWS
        ===================================================== */

        .eagle-intro-glow {

          position: absolute;


          width: 420px;

          height: 420px;


          border-radius: 50%;


          filter:

            blur(120px);


          pointer-events: none;

        }


        .eagle-intro-glow-left {

          left: -180px;

          bottom: -160px;


          background:

            rgba(
              30,
              112,
              210,
              .14
            );


          animation:

            eagleGlowMove
            5s
            ease-in-out
            infinite
            alternate;

        }


        .eagle-intro-glow-right {

          right: -170px;

          top: -150px;


          background:

            rgba(
              255,
              122,
              0,
              .09
            );


          animation:

            eagleGlowMove
            6s
            ease-in-out
            .6s
            infinite
            alternate-reverse;

        }



        /* =====================================================
           MAIN CONTENT
        ===================================================== */

        .eagle-premium-intro-content {

          position: relative;

          z-index: 5;


          width:

            min(
              94vw,
              720px
            );


          display: flex;

          flex-direction: column;

          align-items: center;

          text-align: center;

        }



        /* =====================================================
           BIG LOGO STAGE
        ===================================================== */

        .eagle-premium-logo-stage {

          position: relative;


          width:

            clamp(
              245px,
              25vw,
              350px
            );


          aspect-ratio: 1;


          display: grid;

          place-items: center;


          margin-bottom: 18px;


          opacity: 0;


          transform:

            scale(.58)
            rotate(-4deg);


          animation:

            eagleBigLogoIn
            1.05s
            cubic-bezier(
              .15,
              .95,
              .25,
              1.18
            )
            .08s
            forwards;

        }



        /* =====================================================
           LOGO RINGS
        ===================================================== */

        .eagle-logo-ring {

          position: absolute;


          border-radius: 50%;

        }


        .eagle-logo-ring-one {

          inset: 0;


          border:

            1px dashed
            rgba(
              255,
              122,
              0,
              .28
            );


          animation:

            eagleSpin
            10s
            linear
            infinite;

        }


        .eagle-logo-ring-two {

          inset: 7%;


          border:

            1px solid
            rgba(
              79,
              161,
              255,
              .18
            );


          animation:

            eagleSpinReverse
            8s
            linear
            infinite;

        }


        .eagle-logo-ring-three {

          inset: 15%;


          border:

            1px solid
            rgba(
              255,
              255,
              255,
              .08
            );


          box-shadow:

            0 0 40px
            rgba(
              47,
              126,
              218,
              .08
            );

        }



        /* =====================================================
           ORBIT DOTS
        ===================================================== */

        .eagle-logo-dot {

          position: absolute;


          z-index: 8;


          width: 9px;

          height: 9px;


          border-radius: 50%;

        }


        .eagle-logo-dot-one {

          right: 36px;

          top: 40px;


          background:

            #ff7a00;


          box-shadow:

            0 0 14px
            rgba(
              255,
              122,
              0,
              .85
            );


          animation:

            eagleDotFloat
            2.6s
            ease-in-out
            infinite;

        }


        .eagle-logo-dot-two {

          left: 32px;

          bottom: 52px;


          background:

            #3d96ff;


          box-shadow:

            0 0 14px
            rgba(
              61,
              150,
              255,
              .85
            );


          animation:

            eagleDotFloat
            3s
            ease-in-out
            .8s
            infinite
            reverse;

        }



        /* =====================================================
           LOGO SHELL
        ===================================================== */

        .eagle-logo-big-shell {

          position: relative;


          z-index: 4;


          width: 72%;

          height: 72%;


          display: grid;

          place-items: center;


          overflow: hidden;


          border-radius: 50%;


          background:

            radial-gradient(
              circle at 34% 25%,
              rgba(255,255,255,.14),
              transparent 28%
            ),

            linear-gradient(
              145deg,
              #0b3157 0%,
              #041728 70%,
              #020d18 100%
            );


          border:

            1px solid
            rgba(
              255,
              255,
              255,
              .11
            );


          box-shadow:

            inset
            0
            0
            0
            8px
            rgba(
              255,
              255,
              255,
              .025
            ),

            0
            28px
            65px
            rgba(
              0,
              0,
              0,
              .38
            ),

            0
            0
            70px
            rgba(
              22,
              105,
              195,
              .13
            );


          animation:

            eagleLogoFloat
            3s
            ease-in-out
            1s
            infinite;

        }



        /* =====================================================
           LOGO
        ===================================================== */

        .eagle-premium-big-logo {

          position: relative;


          z-index: 3;


          width: 90%;

          height: 90%;


          object-fit: contain;


          filter:

            drop-shadow(
              0 18px 26px
              rgba(
                0,
                0,
                0,
                .45
              )
            );


          animation:

            eagleLogoPulse
            2.2s
            ease-in-out
            infinite
            alternate;

        }



        /* =====================================================
           LIGHT SWEEP
        ===================================================== */

        .eagle-logo-light-sweep {

          position: absolute;


          inset: -80%;


          background:

            linear-gradient(
              110deg,
              transparent 39%,
              rgba(
                255,
                255,
                255,
                .32
              )
              50%,
              transparent 61%
            );


          transform:

            translateX(-90%)
            rotate(10deg);


          animation:

            eagleLogoSweep
            3.8s
            ease-in-out
            1s
            infinite;

        }



        /* =====================================================
           BRAND
        ===================================================== */

        .eagle-premium-brand {

          display: flex;

          flex-direction: column;

          align-items: center;

        }



        /* EAGLE */

        .eagle-premium-eagle-text {

          display: flex;

          justify-content: center;


          gap:

            clamp(
              6px,
              1.4vw,
              14px
            );

        }


        .eagle-premium-eagle-text span {

          opacity: 0;


          color:

            #ffffff;


          font-family:

            "Cinzel",
            Georgia,
            serif;


          font-size:

            clamp(
              2.4rem,
              7vw,
              4.4rem
            );


          font-weight: 900;


          line-height: 1;


          transform:

            translateY(28px)
            scale(.72)
            rotateX(45deg);


          text-shadow:

            0
            12px
            32px
            rgba(
              0,
              0,
              0,
              .34
            );


          animation:

            eagleLetterPop
            .62s
            cubic-bezier(
              .15,
              .9,
              .25,
              1.25
            )
            var(--delay)
            forwards;

        }



        /* TRANSPORT */

        .eagle-premium-transport-text {

          display: flex;

          justify-content: center;


          gap:

            clamp(
              5px,
              1.1vw,
              10px
            );


          margin-top: 10px;

        }


        .eagle-premium-transport-text span {

          opacity: 0;


          color:

            #ff8214;


          font-size:

            clamp(
              .62rem,
              1.5vw,
              .9rem
            );


          font-weight: 900;


          letter-spacing:

            .06em;


          transform:

            translateY(12px);


          animation:

            eagleTransportIn
            .4s
            ease
            var(--delay)
            forwards;

        }



        /* =====================================================
           DIALOGUE
        ===================================================== */

        .eagle-premium-dialogue {

          display: flex;

          align-items: center;

          justify-content: center;


          gap: 13px;


          margin-top: 18px;


          opacity: 0;


          transform:

            translateY(10px);


          animation:

            eagleDialogueIn
            .7s
            ease
            2.2s
            forwards;

        }


        .eagle-premium-dialogue p {

          margin: 0;


          color:

            rgba(
              220,
              234,
              248,
              .72
            );


          font-size:

            clamp(
              .72rem,
              1.3vw,
              .91rem
            );


          font-weight: 600;


          letter-spacing:

            .04em;


          white-space: nowrap;

        }


        .eagle-premium-dialogue span {

          width: 40px;

          height: 1px;


          background:

            linear-gradient(
              90deg,
              transparent,
              rgba(
                255,
                122,
                0,
                .75
              )
            );

        }


        .eagle-dialogue-line-right {

          transform:

            scaleX(-1);

        }



        /* =====================================================
           STATUS
        ===================================================== */

        .eagle-premium-status {

          display: inline-flex;

          align-items: center;


          gap: 7px;


          min-height: 29px;


          padding:

            0 11px;


          margin-top: 16px;


          border-radius: 999px;


          color:

            #8fe7b8;


          background:

            rgba(
              0,
              194,
              103,
              .07
            );


          border:

            1px solid
            rgba(
              0,
              194,
              103,
              .12
            );


          font-size:

            .53rem;


          font-weight: 900;


          letter-spacing:

            .13em;


          opacity: 0;


          animation:

            eagleStatusIn
            .5s
            ease
            2.55s
            forwards;

        }


        .eagle-status-dot {

          width: 7px;

          height: 7px;


          border-radius: 50%;


          background:

            #00d06e;


          box-shadow:

            0
            0
            12px
            rgba(
              0,
              208,
              110,
              .8
            );


          animation:

            eagleStatusPulse
            1.2s
            ease-in-out
            infinite;

        }



        /* =====================================================
           LOADER
        ===================================================== */

        .eagle-premium-loader {

          width:

            min(
              280px,
              65vw
            );


          margin-top: 20px;


          opacity: 0;


          animation:

            eagleLoaderIn
            .4s
            ease
            2.75s
            forwards;

        }


        .eagle-premium-loader-track {

          height: 2px;


          overflow: hidden;


          border-radius: 999px;


          background:

            rgba(
              255,
              255,
              255,
              .07
            );

        }


        .eagle-premium-loader-track span {

          display: block;


          width: 100%;

          height: 100%;


          transform-origin:

            left center;


          transform:

            scaleX(0);


          background:

            linear-gradient(
              90deg,
              #126ac5,
              #4ba4ff,
              #ff7a00
            );


          box-shadow:

            0
            0
            15px
            rgba(
              69,
              157,
              255,
              .24
            );


          animation:

            eagleLoadProgress
            1.25s
            ease
            2.8s
            forwards;

        }



        /* =====================================================
           PARTICLES
        ===================================================== */

        .eagle-intro-particles span {

          position: absolute;


          width: 4px;

          height: 4px;


          border-radius: 50%;


          background:

            rgba(
              255,
              255,
              255,
              .6
            );


          animation:

            eagleParticleMove
            5s
            ease-in-out
            infinite;

        }


        .eagle-intro-particles span:nth-child(1) {

          top: 17%;

          left: 13%;

        }


        .eagle-intro-particles span:nth-child(2) {

          top: 25%;

          right: 17%;

          animation-delay: .8s;

        }


        .eagle-intro-particles span:nth-child(3) {

          top: 67%;

          left: 9%;

          animation-delay: 1.4s;

        }


        .eagle-intro-particles span:nth-child(4) {

          top: 77%;

          right: 12%;

          animation-delay: .4s;

        }


        .eagle-intro-particles span:nth-child(5) {

          top: 10%;

          left: 52%;

          animation-delay: 1.1s;

        }


        .eagle-intro-particles span:nth-child(6) {

          bottom: 10%;

          left: 43%;

          animation-delay: 1.7s;

        }



        /* =====================================================
           KEYFRAMES
        ===================================================== */

        @keyframes eagleBigLogoIn {

          0% {

            opacity: 0;

            transform:

              scale(.58)
              rotate(-4deg);

            filter:

              blur(8px);

          }


          65% {

            opacity: 1;

            transform:

              scale(1.06)
              rotate(.8deg);

            filter:

              blur(0);

          }


          100% {

            opacity: 1;

            transform:

              scale(1)
              rotate(0);

          }

        }


        @keyframes eagleLogoFloat {

          0%,
          100% {

            transform:

              translateY(0);

          }


          50% {

            transform:

              translateY(-10px);

          }

        }


        @keyframes eagleLogoPulse {

          from {

            transform:

              scale(.98);

          }


          to {

            transform:

              scale(1.045);

          }

        }


        @keyframes eagleLogoSweep {

          0%,
          60% {

            transform:

              translateX(-90%)
              rotate(10deg);

            opacity: 0;

          }


          72% {

            opacity: .8;

          }


          100% {

            transform:

              translateX(90%)
              rotate(10deg);

            opacity: 0;

          }

        }


        @keyframes eagleLetterPop {

          to {

            opacity: 1;


            transform:

              translateY(0)
              scale(1)
              rotateX(0);

          }

        }


        @keyframes eagleTransportIn {

          to {

            opacity: 1;


            transform:

              translateY(0);

          }

        }


        @keyframes eagleDialogueIn {

          to {

            opacity: 1;


            transform:

              translateY(0);

          }

        }


        @keyframes eagleStatusIn {

          to {

            opacity: 1;

          }

        }


        @keyframes eagleStatusPulse {

          0%,
          100% {

            transform:

              scale(.9);

          }


          50% {

            transform:

              scale(1.2);

          }

        }


        @keyframes eagleLoaderIn {

          to {

            opacity: 1;

          }

        }


        @keyframes eagleLoadProgress {

          to {

            transform:

              scaleX(1);

          }

        }


        @keyframes eagleSpin {

          to {

            transform:

              rotate(360deg);

          }

        }


        @keyframes eagleSpinReverse {

          to {

            transform:

              rotate(-360deg);

          }

        }


        @keyframes eagleDotFloat {

          0%,
          100% {

            transform:

              translateY(0)
              scale(.9);

          }


          50% {

            transform:

              translateY(-12px)
              scale(1.1);

          }

        }


        @keyframes eagleGridMove {

          from {

            background-position:

              0 0;

          }


          to {

            background-position:

              48px 48px;

          }

        }


        @keyframes eagleGlowMove {

          from {

            transform:

              translate3d(
                0,
                0,
                0
              );

          }


          to {

            transform:

              translate3d(
                32px,
                20px,
                0
              )
              scale(1.14);

          }

        }


        @keyframes eagleParticleMove {

          0%,
          100% {

            opacity: .2;


            transform:

              translateY(0)
              scale(.8);

          }


          50% {

            opacity: .8;


            transform:

              translateY(-20px)
              scale(1.15);

          }

        }


        @keyframes eagleIntroScreenZoom {

          0% {

            opacity: 1;

            transform:

              scale(1);

          }


          88% {

            opacity: 1;

          }


          100% {

            opacity: 0;

            visibility: hidden;


            transform:

              scale(1.025);

          }

        }



        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 768px) {

          .eagle-premium-intro {

            padding: 16px;

          }


          .eagle-premium-logo-stage {

            width:

              clamp(
                210px,
                62vw,
                265px
              );


            margin-bottom: 13px;

          }


          .eagle-premium-eagle-text {

            gap: 7px;

          }


          .eagle-premium-eagle-text span {

            font-size:

              clamp(
                2.15rem,
                11vw,
                3rem
              );

          }


          .eagle-premium-transport-text {

            gap: 5px;

            margin-top: 8px;

          }


          .eagle-premium-transport-text span {

            font-size:

              .62rem;

          }


          .eagle-premium-dialogue {

            width: 100%;


            gap: 8px;


            margin-top: 14px;

          }


          .eagle-premium-dialogue p {

            font-size:

              .70rem;


            white-space:

              normal;

          }


          .eagle-premium-dialogue span {

            width: 27px;

          }


          .eagle-premium-status {

            margin-top: 13px;

          }


          .eagle-premium-loader {

            margin-top: 15px;

          }

        }



        /* =====================================================
           SMALL MOBILE
        ===================================================== */

        @media (max-width: 390px) {

          .eagle-premium-logo-stage {

            width: 195px;

          }


          .eagle-premium-eagle-text span {

            font-size: 2rem;

          }


          .eagle-premium-dialogue p {

            max-width: 230px;


            font-size:

              .64rem;


            line-height:

              1.4;

          }


          .eagle-premium-status {

            font-size:

              .48rem;

          }

        }

      `}</style>


        </div>

    );

};


export default IntroSplash;