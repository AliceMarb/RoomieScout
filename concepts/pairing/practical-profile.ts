/** Structured practical lifestyle data captured by the paid form. */

export type ApartmentSetup = {
  bathrooms: "one" | "two_plus";
  bedrooms: "separate" | "shared";
  walls: "solid" | "thin" | "unknown";
  commonSpace: "separate_living_room" | "open_plan";
  laundry: "in_unit" | "shared_laundromat";
  furnished: "fully" | "partially" | "unfurnished";
  daytimeOccupancy: "both_wfh" | "both_out" | "mixed" | "i_wfh" | "i_out";
};

export type BathroomTime = "before_7am" | "7_to_9am" | "9_to_11am" | "no_fixed_time";
export type RoutineLength = "under_15min" | "15_to_30min" | "30_to_45min" | "45min_plus";
export type LivingRoomUse = "stay_in_room" | "share_sometimes" | "main_hangout";
export type CallsFromHome = "yes_regularly" | "occasionally" | "no_headphones";
export type HomeDuringDay = "most_days" | "some_days" | "rarely";
export type SharingPreference = "communal" | "separate" | "mix";
export type CostSplitMethod = "kitty" | "split_each" | "splitwise" | "figure_it_out";
export type SleepSchedule = "early_bird" | "in_between" | "night_owl";
export type SleepType = "light_sleeper" | "heavy_sleeper";
export type NightNoise = "headphones_always" | "quiet_audio_ok" | "full_volume_fine";
export type DishTolerance = "same_night" | "next_day" | "few_days" | "no_preference";
export type ChoreSystem = "rota" | "whoever_notices" | "cleaner" | "figure_it_out";
export type TempPreference = "cool" | "comfortable" | "warm";
export type UtilitySplit = "split_evenly" | "usage_based" | "landlord_included";
export type RentReliability = "always_on_time" | "usually_on_time" | "varies";
export type GuestFrequency = "rarely" | "sometimes" | "often";
export type LivingInPartner = "need_to_discuss" | "fine_with_notice" | "dealbreaker";
export type ConflictApproach = "direct" | "hint_mention" | "avoid";
export type ConflictReceiving = "direct_convo" | "text_note" | "just_tell_me" | "figure_it_out";
export type Dealbreaker =
  | "smoking" | "pets" | "cleanliness_standard" | "sleep_schedule"
  | "noise_level" | "guests_parties" | "sharing_food" | "religious_observance" | "other";

export type PracticalProfile = {
  setup: ApartmentSetup;
  bathroomTime: BathroomTime;
  routineLength: RoutineLength;
  livingRoomUse: LivingRoomUse;
  callsFromHome: CallsFromHome;
  homeDuringDay: HomeDuringDay;
  foodSharing: SharingPreference;
  cleaningSupplies: SharingPreference;
  dishesAndCookware: SharingPreference;
  costSplit: CostSplitMethod;
  sleepSchedule: SleepSchedule;
  sleepType: SleepType;
  nightNoise: NightNoise;
  dishTolerance: DishTolerance;
  choreSystem: ChoreSystem;
  tempPreference: TempPreference;
  utilitySplit: UtilitySplit;
  rentReliability: RentReliability;
  guestFrequency: GuestFrequency;
  livingInPartner: LivingInPartner;
  conflictApproach: ConflictApproach;
  conflictReceiving: ConflictReceiving;
  dealbreakers: Dealbreaker[];
};
