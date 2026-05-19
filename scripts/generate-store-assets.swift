import CoreGraphics
import Foundation
import ImageIO
import UniformTypeIdentifiers

enum FitMode {
    case fit
    case fill
}

struct RGBColor {
    let red: CGFloat
    let green: CGFloat
    let blue: CGFloat

    var cgColor: CGColor {
        CGColor(red: red, green: green, blue: blue, alpha: 1.0)
    }
}

struct AssetSpec {
    let source: String
    let output: String
    let width: Int
    let height: Int
    let background: RGBColor
    let mode: FitMode
    let insetX: CGFloat
    let insetY: CGFloat
}

let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)

func url(_ path: String) -> URL {
    root.appendingPathComponent(path)
}

func color(hex: String) -> RGBColor {
    let cleaned = hex.trimmingCharacters(in: CharacterSet(charactersIn: "#"))
    var value: UInt64 = 0
    Scanner(string: cleaned).scanHexInt64(&value)
    return RGBColor(
        red: CGFloat((value >> 16) & 0xff) / 255.0,
        green: CGFloat((value >> 8) & 0xff) / 255.0,
        blue: CGFloat(value & 0xff) / 255.0
    )
}

func loadImage(_ path: String) throws -> CGImage {
    guard let source = CGImageSourceCreateWithURL(url(path) as CFURL, nil),
          let image = CGImageSourceCreateImageAtIndex(source, 0, nil) else {
        throw NSError(domain: "GenerateStoreAssets", code: 1, userInfo: [
            NSLocalizedDescriptionKey: "Could not load image at \(path)"
        ])
    }

    return image
}

func render(_ spec: AssetSpec) throws {
    let image = try loadImage(spec.source)
    let canvas = CGRect(x: 0, y: 0, width: spec.width, height: spec.height)
    let drawArea = canvas.insetBy(dx: spec.insetX, dy: spec.insetY)
    let sourceWidth = CGFloat(image.width)
    let sourceHeight = CGFloat(image.height)

    let scale: CGFloat
    switch spec.mode {
    case .fit:
        scale = min(drawArea.width / sourceWidth, drawArea.height / sourceHeight)
    case .fill:
        scale = max(drawArea.width / sourceWidth, drawArea.height / sourceHeight)
    }

    let drawWidth = sourceWidth * scale
    let drawHeight = sourceHeight * scale
    let drawRect = CGRect(
        x: drawArea.midX - drawWidth / 2,
        y: drawArea.midY - drawHeight / 2,
        width: drawWidth,
        height: drawHeight
    )

    let colorSpace = CGColorSpaceCreateDeviceRGB()
    guard let context = CGContext(
        data: nil,
        width: spec.width,
        height: spec.height,
        bitsPerComponent: 8,
        bytesPerRow: 0,
        space: colorSpace,
        bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue
    ) else {
        throw NSError(domain: "GenerateStoreAssets", code: 2, userInfo: [
            NSLocalizedDescriptionKey: "Could not create bitmap for \(spec.output)"
        ])
    }

    context.setFillColor(spec.background.cgColor)
    context.fill(canvas)
    context.interpolationQuality = .high
    context.draw(image, in: drawRect)

    guard let outputImage = context.makeImage() else {
        throw NSError(domain: "GenerateStoreAssets", code: 3, userInfo: [
            NSLocalizedDescriptionKey: "Could not create image for \(spec.output)"
        ])
    }

    let outputURL = url(spec.output)
    try FileManager.default.createDirectory(
        at: outputURL.deletingLastPathComponent(),
        withIntermediateDirectories: true
    )

    guard let destination = CGImageDestinationCreateWithURL(
        outputURL as CFURL,
        UTType.png.identifier as CFString,
        1,
        nil
    ) else {
        throw NSError(domain: "GenerateStoreAssets", code: 4, userInfo: [
            NSLocalizedDescriptionKey: "Could not create PNG destination for \(spec.output)"
        ])
    }

    CGImageDestinationAddImage(destination, outputImage, nil)

    guard CGImageDestinationFinalize(destination) else {
        throw NSError(domain: "GenerateStoreAssets", code: 5, userInfo: [
            NSLocalizedDescriptionKey: "Could not write PNG for \(spec.output)"
        ])
    }

    print("Generated \(spec.output)")
}

let iconSource = "icon.png"
let logoSource = "Enguistics Redefine English Learning.png"
let dark = color(hex: "#020812")
let white = color(hex: "#ffffff")

let iconSpecs: [AssetSpec] = [
    AssetSpec(source: iconSource, output: "store-assets/app-icon-1024.png", width: 1024, height: 1024, background: dark, mode: .fill, insetX: 0, insetY: 0),
    AssetSpec(source: iconSource, output: "store-assets/play-icon-512.png", width: 512, height: 512, background: dark, mode: .fill, insetX: 0, insetY: 0),
    AssetSpec(source: iconSource, output: "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png", width: 1024, height: 1024, background: dark, mode: .fill, insetX: 0, insetY: 0)
]

let androidIconSizes: [(String, Int)] = [
    ("mipmap-mdpi", 48),
    ("mipmap-hdpi", 72),
    ("mipmap-xhdpi", 96),
    ("mipmap-xxhdpi", 144),
    ("mipmap-xxxhdpi", 192)
]

let androidForegroundSizes: [(String, Int)] = [
    ("mipmap-mdpi", 108),
    ("mipmap-hdpi", 162),
    ("mipmap-xhdpi", 216),
    ("mipmap-xxhdpi", 324),
    ("mipmap-xxxhdpi", 432)
]

let androidSpecs = androidIconSizes.flatMap { density, size in
    [
        AssetSpec(source: iconSource, output: "android/app/src/main/res/\(density)/ic_launcher.png", width: size, height: size, background: dark, mode: .fill, insetX: 0, insetY: 0),
        AssetSpec(source: iconSource, output: "android/app/src/main/res/\(density)/ic_launcher_round.png", width: size, height: size, background: dark, mode: .fill, insetX: 0, insetY: 0)
    ]
} + androidForegroundSizes.map { density, size in
    AssetSpec(source: iconSource, output: "android/app/src/main/res/\(density)/ic_launcher_foreground.png", width: size, height: size, background: dark, mode: .fill, insetX: 0, insetY: 0)
}

let logoSpecs: [AssetSpec] = [
    AssetSpec(source: logoSource, output: "store-assets/company-logo-square-1024.png", width: 1024, height: 1024, background: white, mode: .fit, insetX: 72, insetY: 220),
    AssetSpec(source: logoSource, output: "store-assets/company-logo-feature-1024x500.png", width: 1024, height: 500, background: white, mode: .fit, insetX: 56, insetY: 96)
]

for spec in iconSpecs + androidSpecs + logoSpecs {
    try render(spec)
}
