#include "OnePieceGameInstance.h"
#include "Engine/Engine.h"
#include "Kismet/GameplayStatics.h"

UOnePieceGameInstance::UOnePieceGameInstance()
{
	SelectedCharacter = EOnePieceCharacterType::Luffy;
	InitializeDefaultSettings();
}

void UOnePieceGameInstance::Init()
{
	Super::Init();
	
	UE_LOG(LogTemp, Warning, TEXT("One Piece Wano Game Instance Initialized"));
	
	// Try to load existing save data
	if (DoesSaveGameExist())
	{
		LoadGame();
	}
	else
	{
		// Initialize with default story progress
		StoryProgress = FWanoStoryProgress();
		PlayerStats = FPlayerStats();
	}
}

void UOnePieceGameInstance::InitializeDefaultSettings()
{
	MasterVolume = 1.0f;
	SFXVolume = 1.0f;
	MusicVolume = 1.0f;
	GraphicsQuality = 2; // Medium quality by default
}

void UOnePieceGameInstance::SetStoryProgress(const FWanoStoryProgress& NewProgress)
{
	StoryProgress = NewProgress;
	SaveGame();
}

void UOnePieceGameInstance::CompleteChapter(int32 ChapterNumber)
{
	if (ChapterNumber > StoryProgress.CurrentChapter)
	{
		StoryProgress.CurrentChapter = ChapterNumber;
		
		UE_LOG(LogTemp, Warning, TEXT("Chapter %d completed! Unlocking new content..."), ChapterNumber);
		
		// Unlock content based on chapter progression
		switch (ChapterNumber)
		{
			case 2: // Prison Break Arc
				UnlockCharacter(EOnePieceCharacterType::Zoro);
				UnlockArea(TEXT("Udon Prison"));
				break;
			case 3: // Gathering Allies
				UnlockCharacter(EOnePieceCharacterType::Sanji);
				UnlockCharacter(EOnePieceCharacterType::Nami);
				UnlockArea(TEXT("Flower Capital"));
				break;
			case 4: // Fire Festival Preparation
				UnlockCharacter(EOnePieceCharacterType::Chopper);
				UnlockCharacter(EOnePieceCharacterType::Usopp);
				UnlockArea(TEXT("Ringo"));
				break;
			case 5: // Onigashima Raid
				UnlockCharacter(EOnePieceCharacterType::Robin);
				UnlockCharacter(EOnePieceCharacterType::Franky);
				UnlockCharacter(EOnePieceCharacterType::Brook);
				UnlockCharacter(EOnePieceCharacterType::Jinbe);
				UnlockArea(TEXT("Onigashima"));
				break;
			case 6: // Final Battle
				UnlockCharacter(EOnePieceCharacterType::Yamato);
				UnlockCharacter(EOnePieceCharacterType::Oden);
				break;
			default:
				break;
		}
		
		PlayerStats.MissionsCompleted++;
		SaveGame();
	}
}

void UOnePieceGameInstance::UnlockCharacter(EOnePieceCharacterType Character)
{
	if (!StoryProgress.UnlockedCharacters.Contains(Character))
	{
		StoryProgress.UnlockedCharacters.Add(Character);
		UE_LOG(LogTemp, Warning, TEXT("Character %s unlocked!"), *UEnum::GetValueAsString(Character));
	}
}

void UOnePieceGameInstance::UnlockArea(const FString& AreaName)
{
	if (!StoryProgress.UnlockedAreas.Contains(AreaName))
	{
		StoryProgress.UnlockedAreas.Add(AreaName);
		UE_LOG(LogTemp, Warning, TEXT("Area %s unlocked!"), *AreaName);
	}
}

bool UOnePieceGameInstance::IsCharacterUnlocked(EOnePieceCharacterType Character) const
{
	return StoryProgress.UnlockedCharacters.Contains(Character);
}

bool UOnePieceGameInstance::IsAreaUnlocked(const FString& AreaName) const
{
	return StoryProgress.UnlockedAreas.Contains(AreaName);
}

void UOnePieceGameInstance::SetSelectedCharacter(EOnePieceCharacterType Character)
{
	if (IsCharacterUnlocked(Character))
	{
		SelectedCharacter = Character;
		UE_LOG(LogTemp, Warning, TEXT("Selected character: %s"), *UEnum::GetValueAsString(Character));
	}
	else
	{
		UE_LOG(LogTemp, Warning, TEXT("Cannot select locked character: %s"), *UEnum::GetValueAsString(Character));
	}
}

void UOnePieceGameInstance::IncrementEnemiesDefeated()
{
	PlayerStats.EnemiesDefeated++;
}

void UOnePieceGameInstance::IncrementMissionsCompleted()
{
	PlayerStats.MissionsCompleted++;
}

void UOnePieceGameInstance::IncrementDevilFruitUsage()
{
	PlayerStats.DevilFruitAbilitiesUsed++;
}

void UOnePieceGameInstance::IncrementHakiUsage()
{
	PlayerStats.HakiActivations++;
}

void UOnePieceGameInstance::SaveGame()
{
	// Note: In a full implementation, you would use UGameplayStatics::SaveGameToSlot
	// with a custom USaveGame class to persist the data
	UE_LOG(LogTemp, Warning, TEXT("Game saved! Chapter: %d, Characters: %d"), 
		StoryProgress.CurrentChapter, StoryProgress.UnlockedCharacters.Num());
}

void UOnePieceGameInstance::LoadGame()
{
	// Note: In a full implementation, you would use UGameplayStatics::LoadGameFromSlot
	// to load the saved data
	UE_LOG(LogTemp, Warning, TEXT("Game loaded!"));
}

bool UOnePieceGameInstance::DoesSaveGameExist() const
{
	// Note: In a full implementation, you would use UGameplayStatics::DoesSaveGameExist
	return false; // For now, always return false to use default data
}

void UOnePieceGameInstance::SetMasterVolume(float Volume)
{
	MasterVolume = FMath::Clamp(Volume, 0.0f, 1.0f);
	// Apply volume settings to audio system
}

void UOnePieceGameInstance::SetSFXVolume(float Volume)
{
	SFXVolume = FMath::Clamp(Volume, 0.0f, 1.0f);
	// Apply SFX volume settings
}

void UOnePieceGameInstance::SetMusicVolume(float Volume)
{
	MusicVolume = FMath::Clamp(Volume, 0.0f, 1.0f);
	// Apply music volume settings
}

void UOnePieceGameInstance::SetGraphicsQuality(int32 Quality)
{
	GraphicsQuality = FMath::Clamp(Quality, 0, 3); // 0=Low, 1=Medium, 2=High, 3=Ultra
	// Apply graphics quality settings
}