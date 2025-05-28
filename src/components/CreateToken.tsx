import React, { useState, ChangeEvent } from "react";
import styled, { keyframes } from "styled-components";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { launchToken } from "../services/solanaToken";

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

const Container = styled.div`
  position: relative;
  width: 100%;
  margin-top: 1rem;
  color: #fff;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Spinner = styled.div`
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #fff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: ${rotate} 1s linear infinite;
`;

const Title = styled.h4`
  margin-bottom: 1rem;
`;

const StepsNav = styled.ul`
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
`;

const StepItem = styled.li<{ active: boolean }>`
  flex: 1;
  position: relative;
  text-align: center;
  color: ${({ active }) => (active ? "#fff" : "#777")};
  font-weight: ${({ active }) => (active ? "bold" : "normal")};

  &::before {
    content: "";
    display: block;
    width: 12px;
    height: 12px;
    margin: 0 auto 8px;
    background: ${({ active }) => (active ? "#fff" : "#777")};
    border-radius: 50%;
  }
  &::after {
    content: "";
    position: absolute;
    top: 6px;
    right: -50%;
    width: 100%;
    height: 2px;
    background: #777;
    z-index: -1;
  }
  &:last-child::after {
    display: none;
  }
`;

const StepInfo = styled.p`
  margin-top: 1rem;
  color: #aaa;
`;

const FormSection = styled.div`
  padding: 1rem;
`;

const ErrorText = styled.p`
  color: #f44336;
  margin-bottom: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
`;

const Label = styled.label`
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #fff;
  }
`;

const TextArea = styled.textarea`
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  resize: vertical;
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #fff;
  }
`;

const Select = styled.select`
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  appearance: none;
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #fff;
  }
`;

const ButtonPrimary = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: #1976d2;
  color: #fff;
  cursor: pointer;
  &:disabled {
    background: #555;
    cursor: not-allowed;
  }
`;

const ButtonSecondary = styled(ButtonPrimary)`
  background: transparent;
  border: 1px solid #fff;
`;

const NavButtons = styled.div`
  margin-top: 1.5rem;
  display: flex;
  justify-content: space-between;
`;

const ImageUploadContainer = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  border: 2px dashed #1976d2;
  border-radius: 8px;
  text-align: center;
  background: rgba(255, 255, 255, 0.05);
`;

const Caption = styled.p`
  font-size: 0.75rem;
  color: #aaa;
  margin-top: 0.5rem;
`;

const PreviewWrapper = styled.div`
  margin-top: 1rem;
  position: relative;
  display: inline-block;
`;

const PreviewImage = styled.img`
  width: 128px;
  height: 128px;
  object-fit: contain;
  border-radius: 8px;
  border: 1px solid #555;
`;

const DeleteButton = styled.button`
  position: absolute;
  top: -8px;
  right: -8px;
  background: #fff;
  border: none;
  border-radius: 50%;
  padding: 4px;
  cursor: pointer;
`;

const SwitchInput = styled.input.attrs({ type: "checkbox" })`
  position: relative;
  width: 40px;
  height: 20px;
  -webkit-appearance: none;
  background: #ccc;
  border-radius: 20px;
  outline: none;
  cursor: pointer;
  transition: background 0.2s;
  &:checked {
    background: #4caf50;
  }
  &:before {
    content: "";
    position: absolute;
    top: 1px;
    left: 1px;
    width: 18px;
    height: 18px;
    background: #fff;
    border-radius: 50%;
    transition: transform 0.2s;
  }
  &:checked:before {
    transform: translateX(20px);
  }
`;

const LabelSwitch = styled.label`
  display: flex;
  align-items: center;
  color: #fff;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  & > span {
    margin-left: 0.5rem;
  }
`;

const PreviewList = styled.ul`
  list-style: none;
  padding: 0;
  color: #fff;
  li {
    margin-bottom: 0.5rem;
  }
`;

const steps = [
  "Basic Info",
  "Metadata & Links",
  "Authorities & Gaza Support",
  "Initial Liquidity",
  "Preview & Launch",
];

interface FormData {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
  imageFile?: File;
  imagePreview?: string;
  description: string;
  website: string;
  telegram: string;
  twitter: string;
  discord: string;
  freeze: boolean;
  mint: boolean;
  update: boolean;
  donationAmount: number;
  liquidityPercent: number;
  liquiditySol: number;
  slippage: number;
}

export default function CreateToken() {
  const wallet = useWallet();
  const { connection } = useConnection();

  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState<FormData>({
    name: "",
    symbol: "",
    decimals: 9,
    totalSupply: 1000,
    imageFile: undefined,
    imagePreview: undefined,
    description: "",
    website: "",
    telegram: "",
    twitter: "",
    discord: "",
    freeze: true,
    mint: true,
    update: true,
    donationAmount: 0.1,
    liquidityPercent: 0,
    liquiditySol: 0.1,
    slippage: 0.5,
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const updateField = (field: keyof FormData, value: any) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleImage = (e: ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateField("imageFile", file);
    updateField("imagePreview", url);
  };

  const handleNext = () => setActiveStep((i) => i + 1);
  const handleBack = () => setActiveStep((i) => i - 1);

  const onLaunch = async () => {
    setErrorMsg(null);
    if (!wallet.publicKey || !wallet.signTransaction) {
      setErrorMsg("Please connect your Phantom wallet first.");
      return;
    }
    if (!form.imageFile) {
      setErrorMsg("Logo image is required.");
      return;
    }
    setLoading(true);
    try {
      const mint = await launchToken({
        name: form.name,
        symbol: form.symbol,
        decimals: form.decimals,
        totalSupply: form.totalSupply,
        imageFile: form.imageFile,
        description: form.description,
        website: form.website,
        socials: {
          telegram: form.telegram,
          twitter: form.twitter,
          discord: form.discord,
        },
        authorities: {
          freeze: form.freeze,
          mint: form.mint,
          update: form.update,
        },
        liquidity: {
          percent: form.liquidityPercent,
          solAmount: form.liquiditySol + form.donationAmount,
          slippage: form.slippage,
        },
        wallet,
        connection,
      });
      alert(`Token launched: ${mint.toBase58()}`);
      setActiveStep(0);
      setForm({
        name: "",
        symbol: "",
        decimals: 9,
        totalSupply: 1000,
        imageFile: undefined,
        imagePreview: undefined,
        description: "",
        website: "",
        telegram: "",
        twitter: "",
        discord: "",
        freeze: true,
        mint: true,
        update: true,
        donationAmount: 0.1,
        liquidityPercent: 0,
        liquiditySol: 0.1,
        slippage: 0.5,
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Launch failed");
    } finally {
      setLoading(false);
    }
  };

  const donationOptions = Array.from({ length: 50 }, (_, i) => (i + 1) * 0.1);

  return (
    <Container>
      {loading && (
        <Overlay>
          <Spinner />
          <p style={{ marginTop: "0.5rem" }}>Launching token...</p>
        </Overlay>
      )}

      <Title>Create New Token</Title>

      <StepsNav>
        {steps.map((label, idx) => (
          <StepItem key={label} active={idx === activeStep}>
            {label}
          </StepItem>
        ))}
      </StepsNav>

      <StepInfo>
        Step {activeStep + 1}: {steps[activeStep]}
      </StepInfo>

      <FormSection>
        {errorMsg && <ErrorText>{errorMsg}</ErrorText>}

        {activeStep === 0 && (
          <>
            <FormGroup>
              <Label htmlFor="name">Token Name</Label>
              <Input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="symbol">Symbol (3–5 uppercase)</Label>
              <Input
                id="symbol"
                type="text"
                maxLength={5}
                value={form.symbol}
                onChange={(e) =>
                  updateField("symbol", e.target.value.toUpperCase())
                }
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="decimals">Decimals</Label>
              <Input
                id="decimals"
                type="number"
                value={form.decimals}
                onChange={(e) => updateField("decimals", +e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="totalSupply">Total Supply</Label>
              <Input
                id="totalSupply"
                type="number"
                value={form.totalSupply}
                onChange={(e) => updateField("totalSupply", +e.target.value)}
              />
            </FormGroup>

            <ImageUploadContainer>
              <Label>Upload Logo</Label>
              <ButtonSecondary as="label">
                Select Image
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  hidden
                  onChange={handleImage}
                />
              </ButtonSecondary>
              <Caption>PNG/JPG, max 100 KB, max 512×512px</Caption>
              {form.imagePreview && (
                <PreviewWrapper>
                  <PreviewImage src={form.imagePreview} alt="preview" />
                  <DeleteButton
                    onClick={() => {
                      updateField("imagePreview", undefined);
                      updateField("imageFile", undefined);
                    }}
                  >
                    🙂
                  </DeleteButton>
                </PreviewWrapper>
              )}
            </ImageUploadContainer>
          </>
        )}

        {activeStep === 1 && (
          <>
            <FormGroup>
              <Label htmlFor="description">Description</Label>
              <TextArea
                id="description"
                rows={3}
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
              />
            </FormGroup>
            {(["website", "telegram", "twitter", "discord"] as const).map(
              (field) => (
                <FormGroup key={field}>
                  <Label htmlFor={field}>
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </Label>
                  <Input
                    id={field}
                    type="text"
                    value={form[field]}
                    onChange={(e) => updateField(field, e.target.value)}
                  />
                </FormGroup>
              )
            )}
          </>
        )}

        {activeStep === 2 && (
          <>
            <LabelSwitch>
              <SwitchInput
                checked={form.freeze}
                onChange={(e) => updateField("freeze", e.target.checked)}
              />
              <span>Freeze Authority (0.01 SOL fee)</span>
            </LabelSwitch>
            <LabelSwitch>
              <SwitchInput
                checked={form.mint}
                onChange={(e) => updateField("mint", e.target.checked)}
              />
              <span>Mint Authority (0.01 SOL fee)</span>
            </LabelSwitch>
            <LabelSwitch>
              <SwitchInput
                checked={form.update}
                onChange={(e) => updateField("update", e.target.checked)}
              />
              <span>Update Metadata Authority (0.01 SOL fee)</span>
            </LabelSwitch>
            <FormGroup>
              <Label htmlFor="donationAmount">Gaza Support Fee</Label>
              <Select
                id="donationAmount"
                value={form.donationAmount.toString()}
                onChange={(e) =>
                  updateField("donationAmount", parseFloat(e.target.value))
                }
              >
                {donationOptions.map((amt) => (
                  <option key={amt} value={amt}>
                    {amt.toFixed(1)} SOL
                  </option>
                ))}
              </Select>
              <Caption>Choose an amount to support Gaza (optional)</Caption>
            </FormGroup>
          </>
        )}

        {activeStep === 3 && (
          <>
            <FormGroup>
              <Label htmlFor="liquidityPercent">% Liquidity of Supply</Label>
              <Input
                id="liquidityPercent"
                type="number"
                value={form.liquidityPercent}
                onChange={(e) =>
                  updateField("liquidityPercent", +e.target.value)
                }
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="liquiditySol">SOL for Liquidity</Label>
              <Input
                id="liquiditySol"
                type="number"
                value={form.liquiditySol}
                onChange={(e) => updateField("liquiditySol", +e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="slippage">Slippage Tolerance (%)</Label>
              <Input
                id="slippage"
                type="number"
                value={form.slippage}
                onChange={(e) => updateField("slippage", +e.target.value)}
              />
            </FormGroup>
          </>
        )}

        {activeStep === 4 && (
          <div>
            <Title as="h6">Preview Configuration</Title>
            <PreviewList>
              <li>
                <strong>Name:</strong> {form.name} ({form.symbol})
              </li>
              <li>
                <strong>Decimals:</strong> {form.decimals}
              </li>
              <li>
                <strong>Total Supply:</strong> {form.totalSupply}
              </li>
              <li>
                <strong>Description:</strong> {form.description}
              </li>
              <li>
                <strong>Website:</strong> {form.website}
              </li>
              <li>
                <strong>Socials:</strong> Telegram({form.telegram}), Twitter(
                {form.twitter}), Discord({form.discord})
              </li>
              <li>
                <strong>Authorities:</strong> Freeze({String(form.freeze)}),
                Mint({String(form.mint)}), Update({String(form.update)})
              </li>
              <li>
                <strong>Gaza Support:</strong> {form.donationAmount.toFixed(1)}{" "}
                SOL
              </li>
              <li>
                <strong>Liquidity:</strong> {form.liquidityPercent}% /{" "}
                {form.liquiditySol} SOL / Slippage {form.slippage}%
              </li>
              <li>
                <strong>Logo:</strong> {form.imageFile?.name}
              </li>
            </PreviewList>
          </div>
        )}

        <NavButtons>
          <ButtonSecondary
            onClick={handleBack}
            disabled={activeStep === 0 || loading}
          >
            Back
          </ButtonSecondary>
          {activeStep < steps.length - 1 ? (
            <ButtonPrimary onClick={handleNext}>Next</ButtonPrimary>
          ) : (
            <ButtonPrimary onClick={onLaunch} disabled={loading}>
              Launch Token
            </ButtonPrimary>
          )}
        </NavButtons>
      </FormSection>
    </Container>
  );
}
