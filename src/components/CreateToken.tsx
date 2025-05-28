// src/components/CreateToken.tsx

import React, { useState, ChangeEvent, useRef } from "react";
import styled from "styled-components";
import {
  Box,
  Button,
  TextField,
  Typography,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Switch,
  Slider,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { launchToken } from "../services/solanaToken";

const steps = [
  "Basic Info",
  "Metadata & Links",
  "Authorities & Gaza Support",
  "Initial Liquidity",
  "Preview & Launch",
] as const;

const tokenTypes = ["Standard", "Locked Transfer", "Burnable"] as const;
type TokenType = (typeof tokenTypes)[number];

// 50 options: 0.1, 0.2, …, 5.0
const donationOptions = Array.from({ length: 50 }, (_, i) =>
  parseFloat(((i + 1) * 0.1).toFixed(1))
);

const liquidityMarks = [
  { value: 0, label: "0%" },
  { value: 25, label: "25%" },
  { value: 50, label: "50%" },
  { value: 75, label: "75%" },
  { value: 100, label: "100%" },
];

interface FormData {
  name: string;
  symbol: string;
  tokenType: TokenType;
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
  donationEnabled: boolean;
  donationAmount: number;
  liquidityPercent: number;
  liquiditySol: number;
  slippage: number;
}

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;
const Underlined = styled(Typography)`
  border-bottom: 1px solid #fff;
  padding-bottom: 4px;
  margin-bottom: 8px;
`;
const PreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  background-color: rgba(255, 255, 255, 0.05);
  padding: 16px;
  border-radius: 8px;
`;

export default function CreateToken() {
  const wallet = useWallet();
  const { connection } = useConnection();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState<FormData>({
    name: "",
    symbol: "",
    tokenType: "Standard",
    decimals: 6,
    totalSupply: 10_000_000_000,
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
    donationEnabled: true,
    donationAmount: 0.5,
    liquidityPercent: 0,
    liquiditySol: 0.1,
    slippage: 0.5,
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const updateField = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => setForm((f) => ({ ...f, [field]: value }));

  // Only accept square images; resize later in preview
  const handleImage = (e: ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (img.width !== img.height) {
        setErrorMsg("Logo must be square");
      } else {
        updateField("imageFile", file);
        updateField("imagePreview", url);
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleNext = () => {
    setErrorMsg(null);
    if (activeStep === 0) {
      if (!form.name || !form.symbol) {
        setErrorMsg("Name and symbol are required.");
        return;
      }
      if (!form.imageFile) {
        setErrorMsg("Logo image is required.");
        return;
      }
    }
    setActiveStep((i) => i + 1);
  };
  const handleBack = () => setActiveStep((i) => i - 1);

  const onLaunch = async () => {
    setErrorMsg(null);
    if (!wallet.publicKey || !wallet.signTransaction) {
      setErrorMsg("Please connect your Phantom wallet.");
      return;
    }
    setLoading(true);
    try {
      const mint = await launchToken({
        name: form.name,
        symbol: form.symbol,
        decimals: form.decimals,
        totalSupply: form.totalSupply,
        imageFile: form.imageFile!,
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
          solAmount:
            form.liquiditySol +
            (form.donationEnabled ? form.donationAmount : 0),
          slippage: form.slippage,
        },
        wallet,
        connection,
      });
      alert(`Token launched: ${mint.toBase58()}`);
      // reset
      setActiveStep(0);
      setForm({
        name: "",
        symbol: "",
        tokenType: "Standard",
        decimals: 6,
        totalSupply: 10_000_000_000,
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
        donationEnabled: true,
        donationAmount: 0.5,
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

  const liquidityTokens = Math.floor(
    (form.totalSupply * form.liquidityPercent) / 100
  );

  return (
    <Box sx={{ position: "relative", width: "100%", mt: 4, color: "#fff" }}>
      {loading && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.6)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress color="secondary" />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Launching token...
          </Typography>
        </Box>
      )}

      <Typography variant="h4" gutterBottom>
        Create New Token
      </Typography>

      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, idx) => (
          <Step key={label}>
            <StepLabel
              sx={{
                "& .MuiStepLabel-label": {
                  color:
                    idx === activeStep
                      ? "#BB86FC"
                      : idx < activeStep
                        ? "success.main"
                        : "#fff",
                },
              }}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ p: 3 }}>
        {/* Step 1: Basic Info */}
        {activeStep === 0 && (
          <Column>
            <TextField
              fullWidth
              variant="filled"
              label="Token Name"
              placeholder="Up to 50 characters"
              inputProps={{ maxLength: 50 }}
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              InputLabelProps={{ sx: { color: "#fff" } }}
              InputProps={{ sx: { color: "#fff" } }}
              sx={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            />
            <TextField
              fullWidth
              variant="filled"
              label="Symbol"
              placeholder="3–5 UPPERCASE"
              inputProps={{ maxLength: 5 }}
              value={form.symbol}
              onChange={(e) => updateField("symbol", e.target.value)}
              InputLabelProps={{ sx: { color: "#fff" } }}
              InputProps={{ sx: { color: "#fff" } }}
              sx={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            />
            <TextField
              fullWidth
              variant="filled"
              type="number"
              label="Decimals"
              value={form.decimals}
              onChange={(e) => updateField("decimals", +e.target.value)}
              InputLabelProps={{ sx: { color: "#fff" } }}
              InputProps={{ sx: { color: "#fff" } }}
              sx={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            />
            <TextField
              fullWidth
              variant="filled"
              type="number"
              label="Total Supply"
              value={form.totalSupply}
              onChange={(e) => updateField("totalSupply", +e.target.value)}
              InputLabelProps={{ sx: { color: "#fff" } }}
              InputProps={{ sx: { color: "#fff" } }}
              sx={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            />
            <FormControl
              fullWidth
              variant="filled"
              sx={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            >
              <InputLabel sx={{ color: "#fff" }}>Token Type</InputLabel>
              <Select
                value={form.tokenType}
                onChange={(e: SelectChangeEvent) =>
                  updateField("tokenType", e.target.value as TokenType)
                }
                inputProps={{ style: { color: "#fff" } }}
                sx={{
                  color: "#fff",
                  "& .MuiSelect-icon": { color: "#fff" },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: { backgroundColor: "rgba(0,0,0,0.9)" },
                  },
                }}
              >
                {tokenTypes.map((t) => (
                  <MenuItem
                    key={t}
                    value={t}
                    sx={{
                      color: "#fff",
                      "&.Mui-selected": {
                        backgroundColor: "rgba(255,255,255,0.2)",
                      },
                    }}
                  >
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box
              onClick={() => fileInputRef.current?.click()}
              sx={{
                border: "2px dashed",
                borderColor: "primary.main",
                borderRadius: 2,
                textAlign: "center",
                p: 2,
                backgroundColor: "rgba(255,255,255,0.05)",
                cursor: "pointer",
                color: "#fff",
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept="image/png,image/jpeg"
                onChange={handleImage}
              />
              <Typography mb={1}>
                Click to upload logo (must be square)
              </Typography>
              {form.imagePreview && (
                <Box position="relative" display="inline-block">
                  <img
                    src={form.imagePreview}
                    alt="preview"
                    style={{
                      maxWidth: 128,
                      maxHeight: 128,
                      width: "auto",
                      height: "auto",
                      borderRadius: 8,
                      border: "1px solid #555",
                    }}
                  />
                  <Button
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateField("imageFile", undefined);
                      updateField("imagePreview", undefined);
                    }}
                    sx={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      bgcolor: "background.paper",
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </Button>
                </Box>
              )}
            </Box>
          </Column>
        )}

        {/* Step 2: Metadata & Links */}
        {activeStep === 1 && (
          <Column>
            <TextField
              fullWidth
              variant="filled"
              label="Description"
              placeholder="Enter token description"
              multiline
              rows={3}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              InputLabelProps={{ sx: { color: "#fff" } }}
              InputProps={{ sx: { color: "#fff" } }}
              sx={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            />
            <TextField
              fullWidth
              variant="filled"
              label="Website"
              placeholder="https://"
              value={form.website}
              onChange={(e) => updateField("website", e.target.value)}
              InputLabelProps={{ sx: { color: "#fff" } }}
              InputProps={{ sx: { color: "#fff" } }}
              sx={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            />
            <TextField
              fullWidth
              variant="filled"
              label="Telegram"
              placeholder="@yourchannel"
              value={form.telegram}
              onChange={(e) => updateField("telegram", e.target.value)}
              InputLabelProps={{ sx: { color: "#fff" } }}
              InputProps={{ sx: { color: "#fff" } }}
              sx={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            />
            <TextField
              fullWidth
              variant="filled"
              label="Twitter"
              placeholder="@yourhandle"
              value={form.twitter}
              onChange={(e) => updateField("twitter", e.target.value)}
              InputLabelProps={{ sx: { color: "#fff" } }}
              InputProps={{ sx: { color: "#fff" } }}
              sx={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            />
            <TextField
              fullWidth
              variant="filled"
              label="Discord"
              placeholder="discord.gg/..."
              value={form.discord}
              onChange={(e) => updateField("discord", e.target.value)}
              InputLabelProps={{ sx: { color: "#fff" } }}
              InputProps={{ sx: { color: "#fff" } }}
              sx={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            />
          </Column>
        )}

        {/* Step 3: Authorities & Gaza Support */}
        {activeStep === 2 && (
          <Column>
            <Underlined variant="h6" sx={{ color: "#fff" }}>
              Authorities & Gaza Support
            </Underlined>
            <Row>
              <Switch
                checked={form.donationEnabled}
                onChange={(_, chk) => {
                  updateField("donationEnabled", chk);
                  if (chk) updateField("donationAmount", 0.5);
                }}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": { color: "green" },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "green",
                  },
                  "& .MuiSwitch-track": { backgroundColor: "white" },
                }}
              />
              <Typography sx={{ color: "#fff" }}>
                Enable Gaza Support
              </Typography>
              {form.donationEnabled && (
                <FormControl
                  variant="filled"
                  sx={{
                    ml: 2,
                    minWidth: 120,
                    backgroundColor: "rgba(255,255,255,0.1)",
                  }}
                >
                  <InputLabel sx={{ color: "#fff" }}>Amount</InputLabel>
                  <Select
                    value={form.donationAmount.toString()}
                    onChange={(e) =>
                      updateField("donationAmount", parseFloat(e.target.value))
                    }
                    inputProps={{ style: { color: "#fff" } }}
                    sx={{
                      color: "#fff",
                      "& .MuiSelect-icon": { color: "#fff" },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: { backgroundColor: "rgba(0,0,0,0.9)" },
                      },
                    }}
                  >
                    {donationOptions.map((amt) => (
                      <MenuItem key={amt} value={amt} sx={{ color: "#fff" }}>
                        {amt.toFixed(1)} SOL
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Row>
          </Column>
        )}

        {/* Step 4: Initial Liquidity */}
        {activeStep === 3 && (
          <Column>
            <Underlined variant="h6" sx={{ color: "#fff" }}>
              Initial Liquidity
            </Underlined>
            <Typography sx={{ color: "#fff" }} gutterBottom>
              % Liquidity of Supply
            </Typography>
            <Slider
              value={form.liquidityPercent}
              onChange={(_, v) => updateField("liquidityPercent", v as number)}
              min={0}
              max={100}
              marks={liquidityMarks}
              valueLabelDisplay="on"
              sx={{
                color: "green",
                "& .MuiSlider-thumb": { border: "2px solid #fff" },
                "& .MuiSlider-rail": { backgroundColor: "#555" },
              }}
            />
            <Typography sx={{ color: "#fff" }}>
              Tokens allocated:{" "}
              <strong>{liquidityTokens.toLocaleString()}</strong>
            </Typography>
            <TextField
              variant="filled"
              type="number"
              label="SOL for Liquidity"
              value={form.liquiditySol}
              onChange={(e) => updateField("liquiditySol", +e.target.value)}
              InputLabelProps={{ sx: { color: "#fff" } }}
              InputProps={{ sx: { color: "#fff" } }}
              sx={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            />
            <TextField
              variant="filled"
              type="number"
              label="Slippage Tolerance (%)"
              value={form.slippage}
              onChange={(e) => updateField("slippage", +e.target.value)}
              InputLabelProps={{ sx: { color: "#fff" } }}
              InputProps={{ sx: { color: "#fff" } }}
              sx={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            />
          </Column>
        )}

        {/* Step 5: Preview & Launch */}
        {activeStep === 4 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Preview & Launch
            </Typography>
            <PreviewGrid>
              <Box>
                <strong>Name & Symbol:</strong> {form.name} ({form.symbol})
              </Box>
              <Box>
                <strong>Decimals & Supply:</strong> {form.decimals},{" "}
                {form.totalSupply.toLocaleString()}
              </Box>
              <Box>
                <strong>Token Type:</strong> {form.tokenType}
              </Box>
              <Box>
                <strong>Description:</strong> {form.description || "-"}
              </Box>
              <Box>
                <strong>Website:</strong> {form.website || "-"}
              </Box>
              <Box>
                <strong>Telegram:</strong> {form.telegram || "-"}
              </Box>
              <Box>
                <strong>Twitter:</strong> {form.twitter || "-"}
              </Box>
              <Box>
                <strong>Discord:</strong> {form.discord || "-"}
              </Box>
              <Box>
                <strong>Authorities:</strong> Freeze:
                {form.freeze ? "Yes" : "No"} Mint:
                {form.mint ? "Yes" : "No"} Update:{form.update ? "Yes" : "No"}
              </Box>
              <Box>
                <strong>Gaza Support:</strong>{" "}
                {form.donationEnabled
                  ? `${form.donationAmount} SOL`
                  : "Disabled"}
              </Box>
              <Box>
                <strong>Liquidity:</strong> {form.liquidityPercent}% /{" "}
                {form.liquiditySol} SOL / {form.slippage}% slippage
              </Box>
              <Box>
                <strong>Logo:</strong> {form.imageFile?.name || "-"}
              </Box>
              {form.imagePreview && (
                <Box textAlign="center">
                  <img
                    src={form.imagePreview}
                    alt="logo preview"
                    style={{
                      width: 64,
                      height: 64,
                      objectFit: "contain",
                      borderRadius: 4,
                    }}
                  />
                </Box>
              )}
            </PreviewGrid>
          </Box>
        )}

        {errorMsg && (
          <Typography color="error" sx={{ mt: 2, textAlign: "center" }}>
            {errorMsg}
          </Typography>
        )}

        <Box mt={2} display="flex" justifyContent="space-between">
          <Button
            disabled={activeStep === 0 || loading}
            onClick={handleBack}
            sx={{ color: "#fff" }}
          >
            Back
          </Button>
          {activeStep < steps.length - 1 ? (
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button variant="contained" onClick={onLaunch} disabled={loading}>
              Launch Token
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}
