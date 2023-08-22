import React, { useEffect, useState } from "react";
import styled from "styled-components";
import GradientBar from "./components/GradientBar";
import { useAccount, useSigner } from "wagmi";
import { useModal } from "connectkit";

import {
  baseURL,
  CUSTOM_SCHEMAS,
  EASContractAddress,
  getAddressForENS,
  getAttestation,
} from "./utils/utils";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import invariant from "tiny-invariant";
import { ethers } from "ethers";
import { Link, useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router";
import axios from "axios";

const Title = styled.div`
  color: #163a54;
  font-size: 22px;
  font-family: Montserrat, sans-serif;
`;

const Container = styled.div`
  @media (max-width: 700px) {
    width: 100%;
  }
`;

const MetButton = styled.div`
  border-radius: 10px;
  border: 1px solid #cfb9ff;
  background: #333342;
  width: 100%;
  padding: 20px 10px;
  box-sizing: border-box;
  color: #fff;
  font-size: 18px;
  font-family: Montserrat, sans-serif;
  font-weight: 700;
  cursor: pointer;
`;

const SubText = styled(Link)`
  display: block;
  cursor: pointer;
  text-decoration: underline;
  color: #ababab;
  margin-top: 20px;
`;

const InputContainer = styled.div`
  position: relative;
  height: 90px;
`;

const EnsLogo = styled.img`
  position: absolute;
  left: 14px;
  top: 28px;
  width: 30px;
`;

const InputBlock = styled.input`
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 10px;
  border: 1px solid rgba(19, 30, 38, 0.33);
  background: rgba(255, 255, 255, 0.5);
  color: #131e26;
  font-size: 18px;
  font-family: Chalkboard, sans-serif;
  padding: 20px 10px;
  text-align: center;
  margin-top: 12px;
  box-sizing: border-box;
  width: 100%;
`;

const WhiteBox = styled.div`
  box-shadow: 0 4px 33px rgba(168, 198, 207, 0.15);
  background-color: #fff;
  padding: 36px;
  max-width: 590px;
  border-radius: 10px;
  margin: 40px auto 0;
  text-align: center;
  box-sizing: border-box;

  @media (max-width: 700px) {
    width: 100%;
  }
`;

const eas = new EAS(EASContractAddress);

function Home() {
  const { status, address } = useAccount();
  const modal = useModal();
  const [userAddress, setAddress] = useState("");
  const { data: signer } = useSigner();
  const [attesting, setAttesting] = useState(false);
  const [ensResolvedAddress, setEnsResolvedAddress] = useState("Dakh.eth");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const addressParam = searchParams.get("userAddress");
    if (addressParam) {
      setAddress(addressParam);
    }
  }, []);

  // useEffect(() => {
  //   async function checkENS() {
  //     if (address.includes(".eth")) {
  //       const tmpAddress = await getAddressForENS(address);
  //       if (tmpAddress) {
  //         setEnsResolvedAddress(tmpAddress);
  //       } else {
  //         setEnsResolvedAddress("");
  //       }
  //     } else {
  //       setEnsResolvedAddress("");
  //     }
  //   }

  //   checkENS();
  // }, [address]);

  return (
    <Container>
      <GradientBar />
      <WhiteBox>
        <Title>Please OFACk me.</Title>
        <br />
        <br />
        {/* <InputContainer>
          <InputBlock
            autoCorrect={"off"}
            autoComplete={"off"}
            autoCapitalize={"off"}
            placeholder={"Wallet Address to OFACk.."}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          {ensResolvedAddress && <EnsLogo src={"/ens-logo.png"} />}
        </InputContainer> */}
        <MetButton
          onClick={async () => {
            async function checkOFAC(addr: String) {
              console.log("ofacking address: ", addr);
              return Promise.resolve(true);
            }

            console.log("reading one.");
            if (status !== "connected") {
              modal.setOpen(true);
            } else {
              console.log("attest a go..");
              setAttesting(true);
              try {
                console.log("scheme a go..");

                const schemaEncoder = new SchemaEncoder("bool ofackd");
                console.log("encode a go..");

                const encoded = schemaEncoder.encodeData([
                  { name: "ofackd", type: "bool", value: true },
                ]);
                console.log("invariant a go..");

                invariant(signer, "signer must be defined");
                console.log("connection a go..");

                eas.connect(signer);
                console.log("recipient a go..");
                console.log(address);

                const recipient = address;
                console.log("recipient: ", recipient);

                console.log("actual attest a go..");

                console.log({
                  data: {
                    recipient: recipient,
                    data: encoded,
                    refUID: ethers.constants.HashZero,
                    revocable: true,
                    expirationTime: 0,
                  },
                  schema: CUSTOM_SCHEMAS.MET_IRL_SCHEMA,
                });
                const tx = await eas.attest({
                  data: {
                    recipient: recipient,
                    data: encoded,
                    refUID: ethers.constants.HashZero,
                    revocable: true,
                    expirationTime: 0,
                  },
                  schema: CUSTOM_SCHEMAS.MET_IRL_SCHEMA,
                });
                console.log("tx-------------------------------");
                console.log(tx);
                console.log("wait....");

                const uid = await tx.wait();

                console.log("GET attestation-------------------------------");

                const attestation = await getAttestation(uid);
                console.log("attestation-------------------------------");
                console.log(attestation);
                // Update ENS names
                await Promise.all([
                  axios.get(`${baseURL}/api/getENS/${address}`),
                  axios.get(`${baseURL}/api/getENS/${recipient}`),
                ]);

                navigate(`/connections`);
              } catch (e) {
                console.log("-------------------------------");

                console.log(e);

                console.log("-------------------------------");
              }

              setAttesting(false);
            }
          }}
        >
          {attesting
            ? "Checking... Please wait."
            : status === "connected"
            ? "OFACk My wallet"
            : "Connect wallet"}
        </MetButton>

        {status === "connected" && (
          <>
            <SubText to={"/qr"}>Show my QR code</SubText>
            <SubText to={"/connections"}>Connections</SubText>
          </>
        )}
      </WhiteBox>
    </Container>
  );
}

export default Home;
