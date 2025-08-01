using UnrealBuildTool;

public class OnePieceWanoGame : ModuleRules
{
	public OnePieceWanoGame(ReadOnlyTargetRules Target) : base(Target)
	{
		PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;

		PublicDependencyModuleNames.AddRange(new string[] {
			"Core",
			"CoreUObject",
			"Engine",
			"InputCore",
			"UMG",
			"Slate",
			"SlateCore",
			"AIModule",
			"GameplayTasks",
			"NavigationSystem",
			"Paper2D",
			"EnhancedInput"
		});

		PrivateDependencyModuleNames.AddRange(new string[] {
			"Slate",
			"SlateCore",
			"ToolMenus",
			"EditorStyle",
			"EditorWidgets",
			"GraphEditor",
			"KismetCompiler",
			"PropertyEditor",
			"ReflectionCaptureComponent",
			"RenderCore",
			"ContentBrowser",
			"WorkspaceMenuStructure",
			"EditorSubsystem",
			"UnrealEd"
		});
	}
}