"use client";

import { createForecastAction as orgAdminCreateAction } from "@/app/(protected)/(org-admin)/forecasts/actions";
import { createForecastAction as superAdminCreateAction } from "@/app/(protected)/(super-admin)/orgs/[orgId]/forecasts/actions";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { DataType, ForecastType, PredictionType } from "@/generated/prisma";
import {
  AlertCircle,
  Calendar,
  Check,
  ChevronsUpDown,
  Info,
  Plus,
  Settings,
} from "lucide-react";
import { useActionState, useEffect, useState } from "react";

type Category = {
  id: string;
  name: string;
  color: string | null;
};

type CreateForecastModalProps = {
  orgId: string;
  orgName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Whether this is for org admin context (if true, orgId is ignored) */
  isOrgAdmin?: boolean;
  /** Available categories for the organization */
  categories?: Category[];
};

export default function CreateForecastModal({
  orgId,
  orgName,
  open,
  onOpenChange,
  isOrgAdmin = false,
  categories = [],
}: CreateForecastModalProps) {
  // Use different action based on context
  // Wrap and cast the action so it matches the expected signature for useActionState
  const [state, formAction, isPending] = useActionState(
    isOrgAdmin
      ? orgAdminCreateAction
      : superAdminCreateAction.bind(null, orgId),
    undefined
  );

  const [selectedType, setSelectedType] = useState<ForecastType>(
    state?.data?.type
      ? (state.data.type as ForecastType)
      : ForecastType.CONTINUOUS
  );

  const [selectedDataType, setSelectedDataType] = useState<DataType | "">(
    (state?.data?.dataType as DataType) || ""
  );

  const [selectedPredictionType, setSelectedPredictionType] =
    useState<PredictionType>(
      (state?.data?.predictionType as PredictionType) ||
        PredictionType.INDIVIDUAL
    );

  const [dueDate, setDueDate] = useState<Date | undefined>(
    state?.data?.dueDate ? new Date(state.data.dueDate) : undefined
  );

  const [dataReleaseDate, setDataReleaseDate] = useState<Date | undefined>(
    state?.data?.dataReleaseDate
      ? new Date(state.data.dataReleaseDate)
      : undefined
  );

  // Category management - use categories from database
  const [localCategories, setLocalCategories] =
    useState<Category[]>(categories);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);

  // Sync localCategories with categories prop when it changes
  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [showCategoryPopover, setShowCategoryPopover] = useState(false);

  // Generate random color for new categories
  const generateRandomColor = () => {
    const colors = [
      "#3B82F6", // blue
      "#8B5CF6", // purple
      "#EC4899", // pink
      "#10B981", // green
      "#F59E0B", // amber
      "#EF4444", // red
      "#06B6D4", // cyan
      "#6366F1", // indigo
      "#14B8A6", // teal
      "#F97316", // orange
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Handler to change type
  const handleTypeChange = (value: ForecastType) => {
    setSelectedType(value);
    // Clear dataType if switching away from CONTINUOUS
    if (value !== ForecastType.CONTINUOUS) {
      setSelectedDataType("");
    }
  };

  const handleAddCategory = () => {
    setCategoryError("");

    if (!newCategoryName.trim()) {
      setCategoryError("Category name is required");
      return;
    }

    // Check for duplicate names (case-insensitive)
    const nameExists = localCategories.some(
      (cat) => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase()
    );

    if (nameExists) {
      setCategoryError("A category with this name already exists");
      return;
    }

    // Create temporary category with a temp ID and random color
    const tempCategory: Category = {
      id: `temp-${Date.now()}`,
      name: newCategoryName.trim(),
      color: generateRandomColor(),
    };

    setLocalCategories([...localCategories, tempCategory]);
    setNewCategoryName("");
    setShowCategoryDialog(false);
  };

  const handleCreateCategoryFromCombobox = (name: string) => {
    // Check for duplicate names (case-insensitive)
    const nameExists = localCategories.some(
      (cat) => cat.name.toLowerCase() === name.toLowerCase()
    );

    if (nameExists) {
      return;
    }

    // Create temporary category with a temp ID and random color
    const tempCategory: Category = {
      id: `temp-${Date.now()}`,
      name: name.trim(),
      color: generateRandomColor(),
    };

    setLocalCategories([...localCategories, tempCategory]);
    setSelectedCategoryId(tempCategory.id);
    setCategorySearch(name.trim());
    setShowCategoryPopover(false);
  };

  const filteredCategories = localCategories.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const exactMatch = filteredCategories.find(
    (cat) => cat.name.toLowerCase() === categorySearch.toLowerCase()
  );

  const selectedCategory = localCategories.find(
    (cat) => cat.id === selectedCategoryId
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-full overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Forecast</DialogTitle>
          <DialogDescription className="text-base">
            Create a new forecast for{" "}
            <span className="font-medium text-foreground">{orgName}</span>
          </DialogDescription>
        </DialogHeader>

        <Separator className="my-2" />

        <form action={formAction} className="space-y-6">
          {state?.errors?._form && (
            <div className="flex items-start gap-3 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>{state.errors._form.join(", ")}</div>
            </div>
          )}

          {/* Basic Information Section */}
          <div className="space-y-5">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Info className="h-4 w-4" />
                Basic Information
              </h3>
              <Separator />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Forecast Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                defaultValue={state?.data?.title || ""}
                placeholder="e.g., Will we exceed Q1 revenue targets?"
                aria-invalid={!!state?.errors?.title}
                disabled={isPending}
                className="text-base"
              />
              {state?.errors?.title && (
                <p className="text-sm text-destructive flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {state.errors.title.join(", ")}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description{" "}
                <span className="text-muted-foreground text-xs">
                  (optional)
                </span>
              </Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={state?.data?.description || ""}
                placeholder="Provide additional context or details about this forecast..."
                aria-invalid={!!state?.errors?.description}
                disabled={isPending}
                className="min-h-[100px] resize-none"
              />
              {state?.errors?.description && (
                <p className="text-sm text-destructive flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {state.errors.description.join(", ")}
                </p>
              )}
            </div>
          </div>

          {/* Forecast Configuration Section */}
          <div className="space-y-5">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Forecast Configuration
              </h3>
              <Separator />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type">
                Forecast Type <span className="text-destructive">*</span>
              </Label>
              <Select
                name="type"
                value={selectedType}
                onValueChange={(value) =>
                  handleTypeChange(value as ForecastType)
                }
                disabled={isPending}
              >
                <SelectTrigger aria-invalid={!!state?.errors?.type}>
                  <SelectValue placeholder="Select forecast type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ForecastType.BINARY}>Binary</SelectItem>
                  <SelectItem value={ForecastType.CONTINUOUS}>
                    Continuous
                  </SelectItem>
                </SelectContent>
              </Select>
              {state?.errors?.type && (
                <p className="text-sm text-destructive">
                  {state.errors.type.join(", ")}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                {selectedType === ForecastType.BINARY &&
                  "Binary forecasts have true/false outcomes"}
                {selectedType === ForecastType.CONTINUOUS &&
                  "Continuous forecasts accept numerical values"}
              </p>
            </div>

            {/* Data Type - Only for Continuous */}
            {selectedType === ForecastType.CONTINUOUS && (
              <div className="space-y-2">
                <Label htmlFor="dataType">
                  Data Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  name="dataType"
                  value={selectedDataType}
                  onValueChange={(value) =>
                    setSelectedDataType(value as DataType)
                  }
                  disabled={isPending}
                >
                  <SelectTrigger aria-invalid={!!state?.errors?.dataType}>
                    <SelectValue placeholder="Select data type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={DataType.NUMBER}>Number</SelectItem>
                    <SelectItem value={DataType.CURRENCY}>Currency</SelectItem>
                    <SelectItem value={DataType.PERCENT}>Percent</SelectItem>
                    <SelectItem value={DataType.DECIMAL}>Decimal</SelectItem>
                    <SelectItem value={DataType.INTEGER}>Integer</SelectItem>
                  </SelectContent>
                </Select>
                {state?.errors?.dataType && (
                  <p className="text-sm text-destructive">
                    {state.errors.dataType.join(", ")}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Specify the type of numerical data for proper formatting
                </p>
              </div>
            )}

            {/* Prediction Type */}
            <div className="space-y-3">
              <Label>
                Prediction Submission Type{" "}
                <span className="text-destructive">*</span>
              </Label>
              <RadioGroup
                name="predictionType"
                value={selectedPredictionType}
                onValueChange={(value) =>
                  setSelectedPredictionType(value as PredictionType)
                }
                disabled={isPending}
              >
                <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                  <RadioGroupItem
                    value={PredictionType.INDIVIDUAL}
                    id="individual"
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="individual" className="cursor-pointer">
                      Individual
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Each user submits their own prediction independently
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                  <RadioGroupItem value={PredictionType.GROUP} id="group" />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="group" className="cursor-pointer">
                      Group
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      A single prediction is submitted for all group members
                    </p>
                  </div>
                </div>
              </RadioGroup>
              {state?.errors?.predictionType && (
                <p className="text-sm text-destructive flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {state.errors.predictionType.join(", ")}
                </p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="categoryId">
                  Category <span className="text-destructive">*</span>
                </Label>
              </div>
              <Popover
                open={showCategoryPopover}
                onOpenChange={setShowCategoryPopover}
                modal={true}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={showCategoryPopover}
                    className="w-full justify-between"
                    disabled={isPending}
                    type="button"
                  >
                    {selectedCategory ? (
                      <div className="flex items-center gap-2">
                        {selectedCategory.color && (
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: selectedCategory.color }}
                          />
                        )}
                        {selectedCategory.name}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">
                        Select or type category...
                      </span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-full min-w-[300px] max-w-[400px] p-0"
                  align="start"
                >
                  <div className="p-2">
                    <Input
                      placeholder="Search or type new category..."
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {filteredCategories.length === 0 && categorySearch && (
                      <div className="p-2">
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-sm"
                          onClick={() =>
                            handleCreateCategoryFromCombobox(categorySearch)
                          }
                          type="button"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Create &quot;{categorySearch}&quot;
                        </Button>
                      </div>
                    )}
                    {filteredCategories.length > 0 && (
                      <div className="p-1">
                        {filteredCategories.map((category) => (
                          <Button
                            key={category.id}
                            variant="ghost"
                            className="w-full justify-start text-sm font-normal"
                            onClick={() => {
                              setSelectedCategoryId(category.id);
                              setCategorySearch(category.name);
                              setShowCategoryPopover(false);
                            }}
                            type="button"
                          >
                            {category.color && (
                              <div
                                className="h-3 w-3 rounded-full mr-2"
                                style={{ backgroundColor: category.color }}
                              />
                            )}
                            {category.name}
                            {selectedCategoryId === category.id && (
                              <Check className="ml-auto h-4 w-4" />
                            )}
                          </Button>
                        ))}
                      </div>
                    )}
                    {!exactMatch &&
                      categorySearch.trim() &&
                      filteredCategories.length > 0 && (
                        <div className="border-t p-2">
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-sm"
                            onClick={() =>
                              handleCreateCategoryFromCombobox(categorySearch)
                            }
                            type="button"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Create &quot;{categorySearch}&quot;
                          </Button>
                        </div>
                      )}
                  </div>
                </PopoverContent>
              </Popover>
              <input
                type="hidden"
                name="categoryId"
                value={selectedCategoryId || ""}
              />
              <input
                type="hidden"
                name="categoryName"
                value={selectedCategory?.name || ""}
              />
              <input
                type="hidden"
                name="categoryColor"
                value={selectedCategory?.color || ""}
              />
              {state?.errors?.categoryId && (
                <p className="text-sm text-destructive flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {state.errors.categoryId.join(", ")}
                </p>
              )}
            </div>
          </div>

          {/* Schedule Section */}
          <div className="space-y-5">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Schedule
              </h3>
              <Separator />
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="dueDate">
                Due Date & Time <span className="text-destructive">*</span>
              </Label>
              <DateTimePicker
                date={dueDate}
                onSelect={setDueDate}
                placeholder="Select due date and time"
                disabled={isPending}
              />
              {/* Hidden input to submit the datetime value */}
              <input
                type="hidden"
                name="dueDate"
                value={dueDate ? dueDate.toISOString() : ""}
              />
              {state?.errors?.dueDate && (
                <p className="text-sm text-destructive">
                  {state.errors.dueDate.join(", ")}
                </p>
              )}
            </div>

            {/* Data Release Date */}
            <div className="space-y-2">
              <Label htmlFor="dataReleaseDate">Data Release Date & Time</Label>
              <DateTimePicker
                date={dataReleaseDate}
                onSelect={setDataReleaseDate}
                placeholder="Select data release date and time (optional)"
                disabled={isPending}
              />
              {/* Hidden input to submit the datetime value */}
              <input
                type="hidden"
                name="dataReleaseDate"
                value={dataReleaseDate ? dataReleaseDate.toISOString() : ""}
              />
              {state?.errors?.dataReleaseDate && (
                <p className="text-sm text-destructive">
                  {state.errors.dataReleaseDate.join(", ")}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                When the actual data will be released (must be on or after due
                date)
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              size="lg"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} size="lg">
              {isPending ? "Creating..." : "Create Forecast"}
            </Button>
          </div>
        </form>
      </DialogContent>

      {/* New Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Add a new category for organizing forecasts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newCategoryName">
                Category Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="newCategoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g., Revenue, Sales, Marketing"
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                A color will be automatically assigned to this category
              </p>
            </div>
            {categoryError && (
              <p className="text-sm text-destructive flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                {categoryError}
              </p>
            )}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCategoryDialog(false);
                  setNewCategoryName("");
                  setCategoryError("");
                }}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleAddCategory}>
                Add Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
