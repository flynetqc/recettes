'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createWorker } from 'tesseract.js';
import { parseRawOcrText } from '@/lib/ocr-parser';
import { RecipeForm } from './recipe-form';
import { 
  Scan, 
  Upload, 
  FileText, 
  Sparkles, 
  Loader2, 
  CheckCircle, 
  RefreshCw, 
  Camera, 
  Edit3,
  BookOpen
} from 'lucide-react';

const SAMPLE_RECIPE_TEXT = `TARTE FINE AUX POMMES ET CARAMEL
Préparation : 20 min  Cuisson : 35 min  Pour 6 personnes

INGRÉDIENTS :
- 1 rouleau de pâte feuilletée pur beurre
- 4 pommes golden ou gala
- 40 g de beurre doux
- 30 g de sucre roux
- 1 c. à café de cannelle moulue
- 4 c. à soupe de coulis de caramel au beurre salé

ÉTAPES DE PRÉPARATION :
1. Préchauffer le four à 190°C (375°F) et dérouler la pâte feuilletée sur une plaque garnie de papier sulfurisé.
2. Piquer le fond de pâte à l'aide d'une fourchette en laissant une bordure de 1 cm.
3. Éplucher les pommes, retirer le trognon et les couper en très fines lamelles régulières.
4. Disposer harmonieusement les lamelles de pommes en rosace sur la pâte.
5. Parsemer de petits dés de beurre, saupoudrer de sucre roux et de cannelle.
6. Enfourner pour 30 à 35 minutes jusqu'à ce que la pâte soit bien dorée et croustillante.
7. Napper d'un filet de caramel tiède dès la sortie du four et servir tiède avec de la glace.`;

export function OcrScanner() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [rawOcrResult, setRawOcrResult] = useState<string>('');
  const [parsedRecipe, setParsedRecipe] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'raw' | 'parsed'>('parsed');

  // OCR Processing with Tesseract
  const processImageOcr = async (imageSource: string | File) => {
    try {
      setIsProcessing(true);
      setProgressPercent(10);
      setProgressStatus('Initialisation du moteur de reconnaissance OCR...');

      const worker = await createWorker(['fra', 'eng'], undefined, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgressStatus('Reconnaissance et extraction du texte...');
            setProgressPercent(Math.round(m.progress * 100));
          } else if (m.status === 'loading tesseract core') {
            setProgressStatus('Chargement du noyau Tesseract...');
            setProgressPercent(25);
          } else if (m.status === 'loading language traineddata') {
            setProgressStatus('Chargement du dictionnaire français...');
            setProgressPercent(45);
          }
        }
      });

      const ret = await worker.recognize(imageSource);
      await worker.terminate();

      const extractedText = ret.data.text;
      setRawOcrResult(extractedText);

      // Parse structured recipe
      const parsed = parseRawOcrText(extractedText);
      if (typeof imageSource === 'string') {
        parsed.image_url = imageSource;
      }
      setParsedRecipe(parsed);
      setActiveTab('parsed');
      setProgressPercent(100);
      setProgressStatus('Texte extrait et structuré avec succès !');

    } catch (err: any) {
      console.error('OCR Error:', err);
      setProgressStatus('Erreur lors de l\'extraction du texte.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    processImageOcr(file);
  };

  const handleUseSampleText = () => {
    setSelectedImage('https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?auto=format&fit=crop&w=800&q=80');
    setRawOcrResult(SAMPLE_RECIPE_TEXT);
    const parsed = parseRawOcrText(SAMPLE_RECIPE_TEXT);
    parsed.image_url = 'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?auto=format&fit=crop&w=800&q=80';
    setParsedRecipe(parsed);
    setActiveTab('parsed');
    setProgressPercent(100);
    setProgressStatus('Exemple chargé avec succès !');
  };

  const handleReparseRawText = () => {
    if (!rawOcrResult) return;
    const parsed = parseRawOcrText(rawOcrResult);
    if (selectedImage) {
      parsed.image_url = selectedImage;
    }
    setParsedRecipe(parsed);
    setActiveTab('parsed');
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="rounded-3xl border border-emerald-900/10 bg-gradient-to-r from-emerald-600 to-teal-700 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Numérisation intelligente OCR</span>
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
              Scanner une recette en photo
            </h1>
            <p className="mt-1 max-w-xl text-sm text-emerald-100">
              Prenez en photo une page de votre livre de cuisine préféré ou importez une image.
              L&apos;application extrait les ingrédients, temps et étapes automatiquement !
            </p>
          </div>

          {/* Quick Demo Button */}
          <button
            type="button"
            onClick={handleUseSampleText}
            className="flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md hover:bg-white/25 transition-all"
          >
            <BookOpen className="h-4 w-4" />
            <span>Tester avec un exemple de livre</span>
          </button>
        </div>
      </div>

      {/* Upload & Dropzone Area */}
      {!parsedRecipe && !isProcessing && (
        <div className="rounded-3xl border-2 border-dashed border-zinc-300 bg-white p-8 sm:p-12 text-center shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 mb-4">
            <Scan className="h-8 w-8" />
          </div>

          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Téléversez la photo de votre recette
          </h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
            Glissez-déposez votre image ici, ou cliquez pour sélectionner un fichier JPG, PNG ou prendre une photo avec votre mobile.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700 active:scale-95 transition-all"
            >
              <Upload className="h-4 w-4" />
              <span>Choisir une photo</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      )}

      {/* Processing Animation */}
      {isProcessing && (
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 sm:p-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 mb-4 animate-pulse">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>

          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Analyse OCR de votre recette en cours...
          </h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {progressStatus}
          </p>

          {/* Progress bar */}
          <div className="mx-auto mt-6 max-w-md">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-2 text-right text-xs font-semibold text-zinc-500">
              {progressPercent}%
            </div>
          </div>
        </div>
      )}

      {/* Results & Edit View */}
      {parsedRecipe && !isProcessing && (
        <div className="space-y-6">
          
          {/* Tabs bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-3 dark:border-zinc-800">
            <div className="flex items-center gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
              <button
                type="button"
                onClick={() => setActiveTab('parsed')}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  activeTab === 'parsed'
                    ? 'bg-white text-emerald-700 shadow-sm dark:bg-zinc-900 dark:text-emerald-300'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400'
                }`}
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Formulaire de recette structuré</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('raw')}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  activeTab === 'raw'
                    ? 'bg-white text-emerald-700 shadow-sm dark:bg-zinc-900 dark:text-emerald-300'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Texte brut OCR</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setParsedRecipe(null);
                  setSelectedImage(null);
                  setRawOcrResult('');
                }}
                className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Scanner une autre photo</span>
              </button>
            </div>
          </div>

          {/* Raw text tab */}
          {activeTab === 'raw' && (
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-base">
                    Texte brut reconnu par Tesseract
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Vous pouvez corriger manuellement les fautes de scan ici et relancer la structuration automatique.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleReparseRawText}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Re-structurer la recette</span>
                </button>
              </div>

              <textarea
                rows={14}
                value={rawOcrResult}
                onChange={(e) => setRawOcrResult(e.target.value)}
                className="w-full font-mono text-xs leading-relaxed rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-zinc-800 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-200"
              />
            </div>
          )}

          {/* Parsed structured editor tab */}
          {activeTab === 'parsed' && (
            <div>
              <div className="mb-4 flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-xs font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  La recette a été pré-remplie automatiquement. Vérifiez les ingrédients, les étapes et la note ci-dessous avant d&apos;enregistrer !
                </span>
              </div>

              <RecipeForm
                initialRecipe={parsedRecipe}
                isEditing={false}
                onSuccessRedirect="/"
              />
            </div>
          )}

        </div>
      )}

    </div>
  );
}
