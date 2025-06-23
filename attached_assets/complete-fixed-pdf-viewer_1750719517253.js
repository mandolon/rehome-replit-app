// Key fixes to implement in your component:

// 1. REPLACE the problematic useEffects with this single one:
useEffect(() => {
  console.log("🚀 PDF URL changed, loading:", currentPdfUrl);
  loadPDF();
}, [currentPdfUrl]); // Only when URL actually changes

// 2. WRAP loadPDF in useCallback to prevent unnecessary re-creation:
const loadPDF = useCallback(async () => {
  try {
    setIsLoading(true);
    console.log("📥 Loading PDF from:", currentPdfUrl);
    
    const loadingTask = pdfjsLib.getDocument(currentPdfUrl);
    const pdf = await loadingTask.promise;
    
    console.log("✅ PDF loaded successfully:", pdf.numPages, "pages");
    
    setPdfDoc(pdf);
    setTotalPages(pdf.numPages);
    setCurrentPage(1);
    
    // Calculate and apply fit-to-height scale immediately
    const fitScale = await calculateFitToHeightScale(pdf);
    console.log("📏 Applying initial fit scale:", fitScale);
    setScale(fitScale);
    setFitToHeight(true);
    
    // Clear existing comments and pins
    setPins([]);
    setComments([]);
    
    setIsLoading(false);
    
  } catch (error) {
    console.error("❌ Error loading PDF:", error);
    setIsLoading(false);
    
    toast({
      title: "PDF Loading Error", 
      description: "Failed to load the PDF. Please try again.",
      variant: "destructive",
    });
  }
}, [currentPdfUrl, toast]); // Only recreate when URL changes

// 3. IMPROVE the calculateFitToHeightScale function:
const calculateFitToHeightScale = useCallback(async (pdf?: pdfjsLib.PDFDocumentProxy) => {
  const doc = pdf || pdfDoc;
  if (!doc) {
    console.warn("⚠️ No PDF document available for scale calculation");
    return 1.2;
  }
  
  try {
    const page = await doc.getPage(1);
    const viewport = page.getViewport({ scale: 1 });
    
    // Get container dimensions
    const windowHeight = window.innerHeight;
    const toolbarHeight = 80;
    const padding = 40;
    const extraPadding = 60;
    const containerHeight = windowHeight - toolbarHeight - padding;
    const availableHeight = Math.max(400, containerHeight - extraPadding);
    
    const fitScale = availableHeight / viewport.height;
    const clampedScale = Math.max(0.3, Math.min(3.0, fitScale));
    
    console.log("📏 Calculated fit scale:", {
      windowHeight,
      availableHeight,
      pdfHeight: viewport.height,
      calculatedScale: fitScale,
      clampedScale
    });
    
    return clampedScale;
  } catch (error) {
    console.error("❌ Error calculating fit-to-height scale:", error);
    return 1.2;
  }
}, [pdfDoc]);

// 4. IMPROVE the handleFitToHeight function:
const handleFitToHeight = useCallback(async () => {
  console.log("🎯 Fit to height requested");
  setFitToHeight(true);
  const fitScale = await calculateFitToHeightScale();
  console.log("📏 Applying fit scale:", fitScale);
  setScale(fitScale);
}, [calculateFitToHeightScale]);

// 5. CLEAN UP the resize handler:
useEffect(() => {
  const handleResize = async () => {
    if (fitToHeight && pdfDoc) {
      console.log("🔄 Window resized, recalculating fit scale");
      const newFitScale = await calculateFitToHeightScale(pdfDoc);
      setScale(newFitScale);
    }
  };

  const debouncedResize = debounce(handleResize, 150);
  window.addEventListener('resize', debouncedResize);
  
  return () => {
    window.removeEventListener('resize', debouncedResize);
  };
}, [pdfDoc, fitToHeight, calculateFitToHeightScale]);

// 6. REMOVE all console.log debugging from useEffects that track state changes:
// DELETE this entirely:
/*
useEffect(() => {
  console.log("📊 Scale changed to:", scale);
}, [scale]);
*/